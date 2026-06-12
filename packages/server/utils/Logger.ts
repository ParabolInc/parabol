import tracer from 'dd-trace'
import formats from 'dd-trace/ext/formats'
import util from 'util'

const Levels = {
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
} as const
type LogLevel = keyof typeof Levels

const LOG_LEVEL = Levels[(process.env.LOG_LEVEL || 'info') as LogLevel]
if (!LOG_LEVEL) {
  throw new Error(
    `Invalid LOG_LEVEL: ${process.env.LOG_LEVEL}, allowed values are: ${Object.keys(Levels).join(', ')}`
  )
}

const LogFun = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
} satisfies Record<LogLevel, Console[keyof Console]>

// An Error instance may reach the Logger from multiple layers (e.g. enriched in useDatadogTracing,
// then again by yoga's maskedErrors). Only the first log wins; later ones are dropped.
const loggedErrors = new WeakSet<Error>()
export const markErrorAsLogged = (error: Error) => {
  loggedErrors.add(error)
}

function trace(level: LogLevel, message: any, ...optionalParameters: any[]) {
  if (process.env.DD_LOGS_INJECTION !== 'true') {
    return LogFun[level](message, ...optionalParameters)
  }

  const span = tracer.scope().active()
  const time = new Date().toISOString()
  const tags = optionalParameters
    .map((param) => param.tags)
    .filter((tags) => tags && typeof tags === 'object')
    .reduce((acc, tags) => Object.assign(acc, tags), {} as Record<string, any>)
  const userId = optionalParameters.find((param) => param.userId)?.userId
  if (userId) {
    tags['userId'] = userId
  }
  const ip = optionalParameters.find((param) => param.ip)?.ip
  if (ip) {
    tags['ip'] = ip
  }
  const extras = optionalParameters.find((param) => param?.extras)?.extras
  const error =
    message instanceof Error ? message : optionalParameters.find((param) => param instanceof Error)
  if (error) {
    if (loggedErrors.has(error)) return
    loggedErrors.add(error)
  }

  const record = {
    time,
    level,
    // `status` is what Datadog reads for the log level; Error Tracking requires it to be `error`
    status: level,
    message: error ? error.message : util.format(message, ...optionalParameters),
    tags,
    ...(extras && {extras}),
    // Datadog standard user attribute, correlates with APM's usr.id
    ...(userId && {usr: {id: userId}}),
    // Datadog standard error attributes; error.stack is required for Error Tracking to ingest the log
    ...(error && {
      error: {
        kind: error.name,
        message: error.message,
        stack: error.stack
      }
    })
  }

  if (span) {
    tracer.inject(span.context(), formats.LOG, record)
    if (tags && typeof tags === 'object') {
      span.addTags(tags)
    }
  }

  LogFun[level](JSON.stringify(record))
}

const bindIfEnabled = (level: LogLevel) => {
  if (Levels[level] <= LOG_LEVEL) {
    return trace.bind(null, level)
  }
  return () => {}
}

export const Logger = {
  log: bindIfEnabled('info'),
  error: bindIfEnabled('error'),
  warn: bindIfEnabled('warn'),
  info: bindIfEnabled('info'),
  debug: bindIfEnabled('debug')
}
