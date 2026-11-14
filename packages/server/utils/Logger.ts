import util from 'util'
import {keepFailedTrace} from '../tracing/failedTraces'
import getActiveSpanLogContext from '../tracing/getActiveSpanLogContext'
import describeRequestBody from './describeRequestBody'
import getErrorFingerprint from './getErrorFingerprint'
import isExpectedError from './isExpectedError'
import {maskCredentials} from './maskCredentials'
import {getLogContext, type HttpLogContext, type RequestLogContext} from './requestLogContext'
import {ThirdPartyResponseError} from './ThirdPartyResponseError'

const Levels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
} as const
type LogLevel = keyof typeof Levels

const LOG_LEVEL = Levels[(process.env.LOG_LEVEL || 'info') as LogLevel]
if (LOG_LEVEL === undefined) {
  throw new Error(
    `Invalid LOG_LEVEL: ${process.env.LOG_LEVEL}, allowed values are: ${Object.keys(Levels).join(', ')}`
  )
}

const LogFormats = ['gcp', 'otel'] as const
type LogFormat = (typeof LogFormats)[number]

const LOG_FORMAT = (process.env.LOG_FORMAT || 'gcp') as LogFormat
if (!LogFormats.includes(LOG_FORMAT)) {
  throw new Error(
    `Invalid LOG_FORMAT: ${process.env.LOG_FORMAT}, allowed values are: ${LogFormats.join(', ')}`
  )
}
const isGoogleCloudFormat = LOG_FORMAT === 'gcp'

const LogFun = {
  fatal: (...args: unknown[]) => console.error(...args),
  error: (...args: unknown[]) => console.error(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  info: (...args: unknown[]) => console.info(...args),
  debug: (...args: unknown[]) => console.debug(...args)
} satisfies Record<LogLevel, (...args: unknown[]) => void>

const Severity = {
  fatal: 'CRITICAL',
  error: 'ERROR',
  warn: 'WARNING',
  info: 'INFO',
  debug: 'DEBUG'
} satisfies Record<LogLevel, string>

const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'unknown'
// kysely-ctl loads server modules from source, where the webpack constants don't exist
const isProduction = () => typeof __PRODUCTION__ === 'boolean' && __PRODUCTION__

const logIdentity = {
  service: 'web',
  env: process.env.DEPLOYMENT_ENV || (isProduction() ? 'production' : 'development'),
  version: APP_VERSION
}

export const setLogService = (service: string) => {
  logIdentity.service = service
}

export const getLogIdentity = () => logIdentity

// An Error instance may reach the Logger from multiple layers (e.g. useErrorLogging, then yoga's maskedErrors).
// Only the first log wins; later ones are dropped.
const loggedErrors = new WeakSet<Error>()
export const markErrorAsLogged = (error: Error) => {
  loggedErrors.add(error)
}

export interface GraphQLLogContext {
  path: string
  field?: string
}

export interface ClientLogContext {
  route?: string
  rawRoute?: string
  browser?: string
  os?: string
  userAgent?: string
  componentStack?: string
  breadcrumbs?: unknown[]
  eventId?: string
  count?: number
}

export interface LogOptions {
  tags?: Record<string, unknown>
  userId?: string | null
  ip?: string
  extras?: Record<string, unknown>
  graphql?: GraphQLLogContext
  client?: ClientLogContext
}

const LOG_OPTION_KEYS = new Set<string>(['tags', 'userId', 'ip', 'extras', 'graphql', 'client'])
// Cloud Logging rejects entries over 256 KB
const MAX_RECORD_LENGTH = 250_000
const MAX_CAUSE_DEPTH = 5
const MAX_CAUSE_DESCRIPTION_LENGTH = 1000

const isLogOptions = (param: unknown): param is LogOptions =>
  !!param &&
  typeof param === 'object' &&
  !(param instanceof Error) &&
  Object.keys(param).every((key) => LOG_OPTION_KEYS.has(key))

const findError = (message: unknown, params: unknown[]) =>
  message instanceof Error
    ? message
    : params.find((param): param is Error => param instanceof Error)

const describeThirdPartyResponse = (error: Error) =>
  error instanceof ThirdPartyResponseError ? {response: error.response} : undefined

const describeErrorCode = (error: Error) => {
  const {code} = error as {code?: unknown}
  return typeof code === 'string' ? {code} : undefined
}

const describeCauses = (error: Error) => {
  const causes: Record<string, unknown>[] = []
  const seen = new Set<unknown>([error])
  let cause = error.cause
  while (cause !== undefined && cause !== null && causes.length < MAX_CAUSE_DEPTH) {
    if (seen.has(cause)) break
    seen.add(cause)
    if (!(cause instanceof Error)) {
      causes.push({
        kind: typeof cause,
        message: util
          .inspect(maskCredentials(cause), {depth: 3, breakLength: Infinity})
          .slice(0, MAX_CAUSE_DESCRIPTION_LENGTH)
      })
      break
    }
    causes.push({
      kind: cause.name,
      message: cause.message,
      ...describeErrorCode(cause),
      stack: cause.stack,
      ...describeThirdPartyResponse(cause)
    })
    cause = cause.cause
  }
  return causes
}

const describeHttpRequest = ({
  method,
  route,
  path,
  query,
  contentType,
  body,
  getStatus
}: HttpLogContext) => {
  const status = getStatus?.()
  return {
    method,
    route,
    path,
    ...(status && {status}),
    ...(query && {query: maskCredentials(Object.fromEntries(new URLSearchParams(query)))}),
    ...(body && describeRequestBody(body, contentType))
  }
}

const formatMessage = (message: unknown, params: unknown[], error: Error | undefined) => {
  if (!error) return util.format(message, ...params)
  return message instanceof Error ? error.message : `${util.format(message)}: ${error.message}`
}

export const makeTraceFields = (context: RequestLogContext) => ({
  ...(context.traceId && {
    trace_id: context.traceId,
    span_id: context.spanId,
    trace_flags: context.traceSampled ? '01' : '00'
  }),
  ...(isGoogleCloudFormat &&
    context.traceId && {
      'logging.googleapis.com/trace': context.traceId,
      'logging.googleapis.com/spanId': context.spanId,
      'logging.googleapis.com/trace_sampled': context.traceSampled
    })
})

export const makeLogRecord = (
  level: LogLevel,
  message: unknown,
  params: unknown[],
  context: RequestLogContext = {},
  time = new Date()
) => {
  const options = params.filter(isLogOptions)
  const error = findError(message, params)
  const userId = options.find((option) => option.userId)?.userId ?? context.userId
  const ip = options.find((option) => option.ip)?.ip ?? context.ip
  const extras = options.find((option) => option.extras)?.extras
  const graphql = options.find((option) => option.graphql)?.graphql
  const client = options.find((option) => option.client)?.client
  const tags: Record<string, unknown> = Object.assign(
    {},
    ...options.map((option) => option.tags ?? {}),
    userId && {userId},
    ip && {ip}
  )
  const isFailure = Levels[level] <= Levels.error
  const messageParams = params.filter((param) => param !== error && !isLogOptions(param))
  const service = context.service ?? logIdentity.service
  const version = context.version ?? logIdentity.version
  const {env} = logIdentity
  const causes = error ? describeCauses(error) : []
  return {
    time: time.toISOString(),
    severity: Severity[level],
    level,
    message: formatMessage(message, messageParams, error),
    service,
    env,
    version,
    ...(context.component && {component: context.component}),
    ...makeTraceFields(context),
    ...(userId && {userId}),
    ...(context.orgId && {orgId: context.orgId}),
    ...(context.socketId && {socketId: context.socketId}),
    ...(context.sessionId && {sessionId: context.sessionId}),
    ...(context.operationName && {
      operationName: context.operationName,
      operationKind: context.operationKind
    }),
    ...(graphql && {graphql}),
    ...(isFailure && context.http && {http: describeHttpRequest(context.http)}),
    ...(client && {client}),
    ...(isFailure &&
      context.variables !== undefined && {variables: maskCredentials(context.variables)}),
    ...(Object.keys(tags).length > 0 && {tags}),
    ...(extras && {extras: maskCredentials(extras)}),
    ...(error && {
      error: {
        kind: error.name,
        message: error.message,
        ...describeErrorCode(error),
        stack: error.stack,
        fingerprint: getErrorFingerprint(service, error),
        expected: isExpectedError(error),
        ...(causes.length > 0 && {cause: causes}),
        ...describeThirdPartyResponse(error)
      }
    }),
    ...(isGoogleCloudFormat &&
      error &&
      isFailure && {
        stack_trace: error.stack,
        serviceContext: {service, version},
        context: userId ? {user: userId} : {}
      })
  }
}

type LogRecord = ReturnType<typeof makeLogRecord>

const stringify = (value: unknown) =>
  JSON.stringify(value, (_key, item) => (typeof item === 'bigint' ? item.toString() : item))

const shrinkLogRecord = (record: LogRecord & {account?: unknown}) => {
  const {variables, extras, http, client, error, ...rest} = record
  const {
    body: httpBody,
    bodyLength: _bodyLength,
    ...httpRest
  } = (http ?? {}) as {
    body?: unknown
    bodyLength?: number
  }
  const {breadcrumbs, componentStack, ...clientRest} = client ?? {}
  const causes = error?.cause as Record<string, unknown>[] | undefined
  const measure = (value: unknown) => (value === undefined ? 0 : stringify(value).length)
  return {
    ...rest,
    ...(http && {http: httpRest}),
    ...(client && {client: clientRest}),
    ...(error && {
      error: {
        ...error,
        ...(causes && {cause: causes.map(({stack: _stack, ...cause}) => cause)})
      }
    }),
    omitted: {
      variablesLength: measure(variables),
      extrasLength: measure(extras),
      httpBodyLength: measure(httpBody),
      breadcrumbsLength: measure(breadcrumbs),
      componentStackLength: measure(componentStack),
      causeStacksLength: measure(causes?.map(({stack}) => stack))
    }
  }
}

export const stringifyLogRecord = (record: LogRecord & {account?: unknown}) => {
  let json: string
  try {
    json = stringify(record)
  } catch (e) {
    const {time, severity, level, message, service, env, version} = record
    return stringify({
      time,
      severity,
      level,
      message,
      service,
      env,
      version,
      serializationError: String(e)
    })
  }
  if (json.length <= MAX_RECORD_LENGTH) return json
  return stringify(shrinkLogRecord(record))
}

export type AccountLogContextLoader = (subject: {
  userId?: string
  orgId?: string
}) => Promise<object | undefined>

let loadAccountLogContext: AccountLogContextLoader | undefined

// the server registers this so an error record can say which tier and feature flags its user had. The logger has no database of its own
export const setAccountLogContextLoader = (loader: AccountLogContextLoader | undefined) => {
  loadAccountLogContext = loader
}

const writeRecord = (level: LogLevel, record: LogRecord & {account?: unknown}) => {
  LogFun[level](stringifyLogRecord(record))
}

function trace(level: LogLevel, message: unknown, ...params: unknown[]) {
  const error = findError(message, params)
  if (error && level !== 'fatal') {
    if (loggedErrors.has(error)) return
    loggedErrors.add(error)
  }
  if (!isProduction()) {
    if (error && isExpectedError(error)) {
      LogFun[level](formatMessage(message, [], error), ...params.filter((param) => param !== error))
    } else {
      LogFun[level](message, ...params)
    }
    return
  }
  const context: RequestLogContext = {...getLogContext(), ...getActiveSpanLogContext()}
  const isFailure = Levels[level] <= Levels.error
  if (isFailure && context.traceId && !context.traceSampled && keepFailedTrace(context.traceId)) {
    context.traceSampled = true
  }
  const record = makeLogRecord(level, message, params, context)
  const accountSubject = {userId: record.userId ?? undefined, orgId: context.orgId}
  // a fatal error may be the last thing the process does, so it is written at once
  if (
    level !== 'error' ||
    !loadAccountLogContext ||
    !(accountSubject.userId || accountSubject.orgId)
  ) {
    writeRecord(level, record)
    return
  }
  loadAccountLogContext(accountSubject).then(
    (account) => writeRecord(level, account ? {...record, account} : record),
    () => writeRecord(level, record)
  )
}

const bindIfEnabled = (level: LogLevel) => {
  if (Levels[level] <= LOG_LEVEL) {
    return trace.bind(null, level)
  }
  return () => {}
}

export const Logger = {
  log: bindIfEnabled('info'),
  fatal: bindIfEnabled('fatal'),
  error: bindIfEnabled('error'),
  warn: bindIfEnabled('warn'),
  info: bindIfEnabled('info'),
  debug: bindIfEnabled('debug')
}
