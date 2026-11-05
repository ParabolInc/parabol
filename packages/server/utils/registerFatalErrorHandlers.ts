import {Logger} from './Logger'

const logFatalAndExit = (description: string) => (reason: unknown) => {
  Logger.fatal(description, reason instanceof Error ? reason : new Error(String(reason)))
  process.exit(1)
}

const registerFatalErrorHandlers = () => {
  process.on('uncaughtException', logFatalAndExit('Uncaught exception'))
  process.on('unhandledRejection', logFatalAndExit('Unhandled promise rejection'))
}

export default registerFatalErrorHandlers
