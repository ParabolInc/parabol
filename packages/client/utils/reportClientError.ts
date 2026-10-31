import {addBreadcrumb, type Breadcrumb, getBreadcrumbs, getLastTraceId} from './clientBreadcrumbs'
import {isExtensionError, isIgnoredError} from './errorFilters'
import getReportedRoute from './getReportedRoute'
import getTabSessionId from './getTabSessionId'

type ClientErrorLevel = 'error' | 'warn'

interface ReportOptions {
  level?: ClientErrorLevel
  componentStack?: string | null
  eventId?: string
  traceId?: string
}

interface ClientErrorReport {
  level: ClientErrorLevel
  name: string
  message: string
  stack?: string
  componentStack?: string
  eventId?: string
  traceId?: string
  sessionId: string
  release: string
  route: string
  userAgent: string
  breadcrumbs: Breadcrumb[]
  count: number
}

const CLIENT_ERRORS_URL = '/client-errors'
const MAX_REPORTS_PER_BATCH = 3
const MAX_REPORTS_PER_MINUTE = 20
const FLUSH_DELAY_MS = 1000
const MAX_MESSAGE_LENGTH = 1000
const MAX_STACK_LENGTH = 6000
const MAX_COMPONENT_STACK_LENGTH = 3000
// yoga replaces the message of every error it masks with this one
const MASKED_ERROR_MESSAGE = 'Unexpected error.'
const RELEASE = __APP_VERSION__

let queue: ClientErrorReport[] = []
let flushTimer: ReturnType<typeof setTimeout> | undefined
const recentReportTimes: number[] = []

const describeReason = (reason: unknown) => {
  try {
    return JSON.stringify(reason) ?? String(reason)
  } catch {
    return String(reason)
  }
}

const toError = (reason: unknown) => {
  if (reason instanceof Error) return reason
  return new Error(typeof reason === 'string' ? reason : describeReason(reason))
}

const isOverRateLimit = (now: number) => {
  while (recentReportTimes.length > 0 && recentReportTimes[0]! <= now - 60_000) {
    recentReportTimes.shift()
  }
  if (recentReportTimes.length >= MAX_REPORTS_PER_MINUTE) return true
  recentReportTimes.push(now)
  return false
}

export const flushClientErrors = () => {
  clearTimeout(flushTimer)
  flushTimer = undefined
  if (queue.length === 0) return
  const body = JSON.stringify({reports: queue})
  queue = []
  const blob = new Blob([body], {type: 'text/plain;charset=UTF-8'})
  if (!navigator.sendBeacon(CLIENT_ERRORS_URL, blob)) {
    fetch(CLIENT_ERRORS_URL, {method: 'POST', body, keepalive: true}).catch(() => {})
  }
}

const reportClientError = (reason: unknown, options: ReportOptions = {}) => {
  const error = toError(reason)
  if (isExtensionError(error)) return
  const message = error.message.slice(0, MAX_MESSAGE_LENGTH)
  const stack = error.stack?.slice(0, MAX_STACK_LENGTH)
  const repeat = queue.find(
    (report) => report.name === error.name && report.message === message && report.stack === stack
  )
  if (repeat) {
    repeat.count++
    return
  }
  if (isOverRateLimit(Date.now())) return
  const {componentStack, eventId} = options
  queue.push({
    level: isIgnoredError(error) ? 'warn' : (options.level ?? 'error'),
    name: error.name,
    message,
    stack,
    componentStack: componentStack?.slice(0, MAX_COMPONENT_STACK_LENGTH),
    eventId,
    traceId: options.traceId ?? getLastTraceId(),
    sessionId: getTabSessionId(),
    release: RELEASE,
    route: getReportedRoute(window.location.pathname),
    userAgent: navigator.userAgent,
    breadcrumbs: getBreadcrumbs(),
    count: 1
  })
  addBreadcrumb('error', `${error.name}: ${message}`)
  if (queue.length >= MAX_REPORTS_PER_BATCH) {
    flushClientErrors()
  } else {
    flushTimer ??= setTimeout(flushClientErrors, FLUSH_DELAY_MS)
  }
}

// The server already logged the cause with this trace id, so a warning is enough to join the browser's side to it
export const reportClientWarning = (name: string, message: string, traceId?: string) => {
  const warning = new Error(message)
  warning.name = name
  warning.stack = undefined
  reportClientError(warning, {level: 'warn', traceId})
}

export const reportUnexpectedGraphQLErrors = (
  errors: readonly {message: string}[] | undefined,
  operationName: string,
  traceId?: string
) => {
  if (errors?.some((error) => error.message === MASKED_ERROR_MESSAGE)) {
    reportClientWarning('UnexpectedGraphQLError', `${operationName} failed on the server`, traceId)
  }
}

export default reportClientError
