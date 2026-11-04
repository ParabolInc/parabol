import parseSessionId from './parseSessionId'

export const MAX_CLIENT_ERROR_REPORTS = 10
const MAX_BREADCRUMBS = 30
const MAX_REPEAT_COUNT = 1000
const TRACE_ID = /^[0-9a-f]{32}$/
const EVENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const RELEASE = /^[\w.+-]{1,64}$/
const BREADCRUMB_TYPES = new Set(['operation', 'navigation', 'websocket', 'error'])

export interface ClientErrorBreadcrumb {
  time: string
  type: string
  message: string
  traceId?: string
}

export interface ClientErrorReport {
  level: 'error' | 'warn'
  name: string
  message: string
  stack?: string
  componentStack?: string
  eventId?: string
  traceId?: string
  sessionId?: string
  release?: string
  route?: string
  userAgent?: string
  count: number
  breadcrumbs: ClientErrorBreadcrumb[]
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const readString = (value: unknown, maxLength: number) =>
  typeof value === 'string' && value.length > 0 ? value.slice(0, maxLength) : undefined

const readMatch = (value: unknown, pattern: RegExp) =>
  typeof value === 'string' && pattern.test(value) ? value : undefined

const readCount = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value > 0
    ? Math.min(value, MAX_REPEAT_COUNT)
    : 1

const parseBreadcrumb = (value: unknown): ClientErrorBreadcrumb | undefined => {
  if (!isRecord(value)) return undefined
  const time = readString(value.time, 40)
  const type = readString(value.type, 20)
  const message = readString(value.message, 300)
  if (!time || !type || !BREADCRUMB_TYPES.has(type) || !message) return undefined
  const traceId = readMatch(value.traceId, TRACE_ID)
  return {time, type, message, ...(traceId && {traceId})}
}

const parseReport = (value: unknown): ClientErrorReport | undefined => {
  if (!isRecord(value)) return undefined
  const message = readString(value.message, 1000)
  if (!message) return undefined
  const breadcrumbs = Array.isArray(value.breadcrumbs) ? value.breadcrumbs : []
  return {
    level: value.level === 'warn' ? 'warn' : 'error',
    name: readString(value.name, 100) ?? 'Error',
    message,
    stack: readString(value.stack, 16_000),
    componentStack: readString(value.componentStack, 8_000),
    eventId: readMatch(value.eventId, EVENT_ID),
    traceId: readMatch(value.traceId, TRACE_ID),
    sessionId: parseSessionId(value.sessionId),
    release: readMatch(value.release, RELEASE),
    route: readString(value.route, 300),
    userAgent: readString(value.userAgent, 300),
    count: readCount(value.count),
    breadcrumbs: breadcrumbs
      .slice(-MAX_BREADCRUMBS)
      .map(parseBreadcrumb)
      .filter((breadcrumb): breadcrumb is ClientErrorBreadcrumb => !!breadcrumb)
  }
}

const parseClientErrorBatch = (body: unknown) => {
  if (!isRecord(body) || !Array.isArray(body.reports)) return null
  const {reports} = body
  if (reports.length === 0 || reports.length > MAX_CLIENT_ERROR_REPORTS) return null
  return reports.map(parseReport).filter((report): report is ClientErrorReport => !!report)
}

export default parseClientErrorBatch
