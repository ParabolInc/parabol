import reportClientError, {flushClientErrors} from './reportClientError'

// browsers report these with no error object to look into
const IGNORED_ERROR_EVENTS = ['ResizeObserver loop', 'Script error']

const registerClientErrorHandlers = () => {
  window.addEventListener('error', (event) => {
    if (IGNORED_ERROR_EVENTS.some((message) => event.message?.startsWith(message))) return
    reportClientError(event.error ?? event.message)
  })
  window.addEventListener('unhandledrejection', (event) => {
    reportClientError(event.reason)
  })
  window.addEventListener('pagehide', flushClientErrors)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushClientErrors()
  })
}

export default registerClientErrorHandlers
