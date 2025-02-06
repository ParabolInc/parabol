import tracer from 'dd-trace'
import formats from 'dd-trace/ext/formats'
import util from 'util'

type LogLevel = 'error' | 'warn' | 'info' | 'debug'
const LogFun = {
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
} satisfies Record<LogLevel, Console[keyof Console]>

function trace(level: LogLevel, message: any, ...optionalParameters: any[]) {
  if (process.env.DD_LOGS_INJECTION !== 'true') {
    return LogFun[level](message, ...optionalParameters)
  }

  const span = tracer.scope().active()
  const time = new Date().toISOString()
  const record = {time, level, message: util.format(message, optionalParameters)}

  if (span) {
    tracer.inject(span.context(), formats.LOG, record)
    const tags = optionalParameters.find((param) => param.tags) as Record<string, any> | undefined
    if (tags && typeof tags === 'object') {
      span.addTags(tags)
    }
  }

  LogFun[level](JSON.stringify(record))
}

export const Logger = {
  log: trace.bind(null, 'info'),
  error: trace.bind(null, 'error'),
  warn: trace.bind(null, 'warn'),
  info: trace.bind(null, 'info'),
  debug: trace.bind(null, 'debug')
}
