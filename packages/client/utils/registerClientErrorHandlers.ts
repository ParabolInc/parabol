import {getStackScripts, isAppScript} from './errorFilters'
import reportClientError, {
  describeReason,
  flushClientErrors,
  isError,
  isReportedError
} from './reportClientError'

// browsers report a ResizeObserver loop with no error object to look into, and a failed service worker update retries on its own
// Each browser words that failure differently, so it is matched by what createWSClient logs with it
const IGNORED_MESSAGES = ['ResizeObserver loop', 'Error updating service worker']

const isIgnoredMessage = (message: string | undefined) =>
  IGNORED_MESSAGES.some((ignored) => message?.includes(ignored))

const describeConsoleArg = (arg: unknown) => {
  if (isError(arg)) return arg.message
  return typeof arg === 'string' ? arg : describeReason(arg)
}

// Extensions and other hosts' scripts log to the page's console too. Below this wrapper's own frame,
// a frame of the app's means the app logged it, even through a console an extension wraps
const isLoggedByApp = (callStack: string | undefined) => {
  const [ownFrame, ...callerFrames] = getStackScripts(callStack).filter(isAppScript)
  return !ownFrame || callerFrames.length > 0
}

const reportConsoleError = (args: unknown[], callStack: string | undefined) => {
  if (!isLoggedByApp(callStack)) return
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
  // the event names the script that threw, even one that failed to parse and so has no stack.
  // A browser leaves it empty for another origin's script, whose error reads "Script error."
  window.addEventListener('error', (event) => {
    if (isIgnoredMessage(event.message) || !isAppScript(event.filename)) return
    reportClientError(event.error ?? event.message)
  })
  // a string, a plain object or a browser API's error has no frame to tell whose it is
  window.addEventListener('unhandledrejection', ({reason}) => {
    const hasThrowingFrame = isError(reason) && getStackScripts(reason.stack).length > 0
    reportClientError(reason, hasThrowingFrame ? undefined : {level: 'warn'})
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
