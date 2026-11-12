import reportClientError, {
  describeReason,
  flushClientErrors,
  isError,
  isReportedError
} from './reportClientError'

// browsers report the first two with no error object to look into, and a failed service worker update retries on its own
// Each browser words that failure differently, so it is matched by what createWSClient logs with it
const IGNORED_MESSAGES = ['ResizeObserver loop', 'Script error', 'Error updating service worker']

const isIgnoredMessage = (message: string | undefined) =>
  IGNORED_MESSAGES.some((ignored) => message?.includes(ignored))

const describeConsoleArg = (arg: unknown) => {
  if (isError(arg)) return arg.message
  return typeof arg === 'string' ? arg : describeReason(arg)
}

// Extensions run scripts in the page and log to its console, but only the page's own scripts are served over http
const isLoggedByPage = (callStack: string | undefined) => {
  if (!callStack) return true
  const [ownFrame, ...callerFrames] = callStack
    .split('\n')
    .filter((frame) => /https?:\/\//.test(frame))
  return !ownFrame || callerFrames.length > 0
}

const reportConsoleError = (args: unknown[], callStack: string | undefined) => {
  if (!isLoggedByPage(callStack)) return
  const message = args.map(describeConsoleArg).join(' ')
  if (isIgnoredMessage(message)) return
  const cause = args.find(isError)
  // React logs an error a boundary caught before the boundary reports it with its component stack
  queueMicrotask(() => {
    if (cause && isReportedError(cause)) return
    if (cause && args.length === 1) {
      reportClientError(cause)
      return
    }
    const error = new Error(message)
    error.name = cause?.name ?? 'ConsoleError'
    if (cause) {
      error.stack = cause.stack
    }
    reportClientError(error)
  })
}

const registerClientErrorHandlers = () => {
  window.addEventListener('error', (event) => {
    if (isIgnoredMessage(event.message)) return
    reportClientError(event.error ?? event.message)
  })
  window.addEventListener('unhandledrejection', (event) => {
    reportClientError(event.reason)
  })
  window.addEventListener('pagehide', flushClientErrors)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushClientErrors()
  })
  // development logs React's warnings with console.error
  if (__PRODUCTION__) {
    const consoleError = console.error
    console.error = (...args: unknown[]) => {
      consoleError(...args)
      reportConsoleError(args, new Error().stack)
    }
  }
}

export default registerClientErrorHandlers
