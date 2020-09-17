import debug from 'debug'

const APP_NAME = 'mediasoup-parabol'

export default class Logger {
  debug: debug.Debugger
  info: debug.Debugger
  warn: debug.Debugger
  error: debug.Debugger

  constructor(prefix?: string) {
    this.debug = debug(prefix ? `${APP_NAME}:${prefix}` : `${APP_NAME}`)
    this.info = debug(prefix ? `${APP_NAME}:INFO:${prefix}` : `${APP_NAME}:INFO`)
    this.warn = debug(prefix ? `${APP_NAME}:WARN:${prefix}` : `${APP_NAME}:WARN`)
    this.error = debug(prefix ? `${APP_NAME}:ERROR:${prefix}` : `${APP_NAME}:ERROR`)
    this.debug.log = console.info.bind(console)
    this.info.log = console.info.bind(console)
    this.warn.log = console.warn.bind(console)
    this.error.log = console.error.bind(console)
  }
}
