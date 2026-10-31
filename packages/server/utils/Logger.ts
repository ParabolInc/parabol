import tracer from 'dd-trace'
import formats from 'dd-trace/ext/formats'
import {GraphQLError} from 'graphql'
import util from 'util'
import getErrorFingerprint from './getErrorFingerprint'
import {maskCredentials} from './maskCredentials'
import {getLogContext, type RequestLogContext} from './requestLogContext'

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

const DatadogStatus = {
  fatal: 'critical',
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug'
} satisfies Record<LogLevel, string>

const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'unknown'
// kysely-ctl loads server modules from source, where the webpack constants don't exist
const isProduction = () => typeof __PRODUCTION__ === 'boolean' && __PRODUCTION__

const logIdentity = {
  service: 'web',
  env: process.env.DD_ENV || (isProduction() ? 'production' : 'development'),
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

export interface LogOptions {
  tags?: Record<string, unknown>
  userId?: string | null
  ip?: string
  extras?: Record<string, unknown>
}

const LOG_OPTION_KEYS = new Set<string>(['tags', 'userId', 'ip', 'extras'])
// Cloud Logging rejects entries over 256 KB
const MAX_RECORD_LENGTH = 250_000

const isLogOptions = (param: unknown): param is LogOptions =>
  !!param &&
  typeof param === 'object' &&
  !(param instanceof Error) &&
  Object.keys(param).every((key) => LOG_OPTION_KEYS.has(key))

const findError = (message: unknown, params: unknown[]) =>
  message instanceof Error
    ? message
    : params.find((param): param is Error => param instanceof Error)

const isExpectedError = (error: Error): boolean =>
  error instanceof GraphQLError && (!error.originalError || isExpectedError(error.originalError))

const formatMessage = (message: unknown, params: unknown[], error: Error | undefined) => {
  if (!error) return util.format(message, ...params)
  return message instanceof Error ? error.message : `${util.format(message)}: ${error.message}`
}

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
  return {
    time: time.toISOString(),
    severity: Severity[level],
    status: DatadogStatus[level],
    level,
    message: formatMessage(message, messageParams, error),
    service,
    env,
    version,
    ...(context.component && {component: context.component}),
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
      }),
    ...(userId && {userId, usr: {id: userId}}),
    ...(context.socketId && {socketId: context.socketId}),
    ...(context.sessionId && {sessionId: context.sessionId}),
    ...(context.operationName && {
      operationName: context.operationName,
      operationKind: context.operationKind
    }),
    ...(isFailure &&
      context.variables !== undefined && {variables: maskCredentials(context.variables)}),
    ...(Object.keys(tags).length > 0 && {tags}),
    ...(extras && {extras: maskCredentials(extras)}),
    ...(error && {
      error: {
        kind: error.name,
        message: error.message,
        stack: error.stack,
        fingerprint: getErrorFingerprint(service, error),
        expected: isExpectedError(error)
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

export const stringifyLogRecord = (record: LogRecord) => {
  let json: string
  try {
    json = stringify(record)
  } catch (e) {
    const {time, severity, status, level, message, service, env, version} = record
    return stringify({
      time,
      severity,
      status,
      level,
      message,
      service,
      env,
      version,
      serializationError: String(e)
    })
  }
  if (json.length <= MAX_RECORD_LENGTH) return json
  const {variables, extras, ...rest} = record
  return stringify({
    ...rest,
    omitted: {
      variablesLength: variables === undefined ? 0 : stringify(variables).length,
      extrasLength: extras === undefined ? 0 : stringify(extras).length
    }
  })
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
  const record = makeLogRecord(level, message, params, getLogContext())
  if (process.env.DD_LOGS_INJECTION === 'true') {
    const span = tracer.scope().active()
    if (span) {
      tracer.inject(span.context(), formats.LOG, record)
      if (record.tags) {
        span.addTags(record.tags)
      }
    }
  }
  LogFun[level](stringifyLogRecord(record))
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
