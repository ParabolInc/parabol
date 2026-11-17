import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {REPORTED_ROUTES} from '../client/shared/reportedRoutes'
import getRateLimiter from './graphql/getRateLimiter'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import {
  clientNavigationDuration,
  clientNavigationQueriesInSequence,
  clientNavigationSuspendedQueries
} from './metricsHandler'
import parseBody from './parseBody'
import uwsGetIP from './utils/uwsGetIP'

const MAX_BODY_BYTES = 16 * 1024
const MAX_BATCHES_PER_IP_PER_MINUTE = 30
const MAX_NAVIGATIONS_PER_BATCH = 20
const MAX_DURATION_MS = 20_000
const MAX_QUERIES = 50
const ROUTES = new Set<string>(REPORTED_ROUTES)
const KINDS = new Set(['load', 'navigate'])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const readCount = (value: unknown, max: number) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max
    ? value
    : undefined

const parseNavigation = (value: unknown) => {
  if (!isRecord(value)) return undefined
  const {route, kind} = value
  if (typeof route !== 'string' || !ROUTES.has(route)) return undefined
  if (typeof kind !== 'string' || !KINDS.has(kind)) return undefined
  const durationMs = readCount(value.durationMs, MAX_DURATION_MS)
  const queriesInSequence = readCount(value.queriesInSequence, MAX_QUERIES)
  const suspendedQueries = readCount(value.suspendedQueries, MAX_QUERIES)
  if (durationMs === undefined || queriesInSequence === undefined) return undefined
  if (suspendedQueries === undefined) return undefined
  return {route, kind, durationMs, queriesInSequence, suspendedQueries}
}

export const clientMetricsHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const ip = uwsGetIP(res, req)
  if (Number(req.getHeader('content-length')) > MAX_BODY_BYTES) {
    res.writeStatus('413').end()
    return
  }
  const {lastMinute} = getRateLimiter().log(`clientMetrics:${ip}`, 'clientMetrics', false)
  if (lastMinute > MAX_BATCHES_PER_IP_PER_MINUTE) {
    res.writeStatus('429').end()
    return
  }
  const body = await parseBody({res, maxBytes: MAX_BODY_BYTES})
  if (!isRecord(body) || !Array.isArray(body.navigations)) {
    res.writeStatus('400').end()
    return
  }
  res.writeStatus('204').end()
  for (const value of body.navigations.slice(0, MAX_NAVIGATIONS_PER_BATCH)) {
    const navigation = parseNavigation(value)
    if (!navigation) continue
    const labels = {route: navigation.route, kind: navigation.kind}
    clientNavigationDuration.observe(labels, navigation.durationMs / 1000)
    clientNavigationQueriesInSequence.observe(labels, navigation.queriesInSequence)
    clientNavigationSuspendedQueries.observe(labels, navigation.suspendedQueries)
  }
})
