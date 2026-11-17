import type {LogEvent, RequestDescriptor} from 'relay-runtime'
import type {ReportedRoute} from '../shared/reportedRoutes'

type NavigationKind = 'load' | 'navigate'

// Relay's hooks log this when a fragment suspends, but Relay's types still only list the legacy suspense.fragment
type RelayLogEvent =
  | LogEvent
  | {name: 'suspense.missing_data'; pendingOperations: readonly RequestDescriptor[]}

interface QueryTiming {
  start: number
  end?: number
}

interface PendingNavigation {
  route: ReportedRoute | null
  kind: NavigationKind
  start: number
  queriesByNetworkRequestId: Map<number, QueryTiming>
  suspendedQueryIds: Set<string>
  lastChangeAt: number
  settleTimer?: ReturnType<typeof setTimeout>
}

export interface NavigationTiming {
  route: ReportedRoute
  kind: NavigationKind
  durationMs: number
  queriesInSequence: number
  queryCount: number
  suspendedQueries: number
}

const CLIENT_METRICS_URL = '/client-metrics'
// A navigation is over once no query is in flight and the page has not changed for this long
const QUIET_MS = 400
// A page load waits this long for its first query, since the app has to start before it can ask for anything
const MAX_WAIT_FOR_FIRST_QUERY_MS = 5_000
const MAX_DURATION_MS = 20_000
const FLUSH_DELAY_MS = 5_000
const MAX_TIMINGS_PER_BATCH = 20

let pendingNavigation: PendingNavigation | undefined
let hasLoaded = false
let queue: NavigationTiming[] = []
let flushTimer: ReturnType<typeof setTimeout> | undefined
let pageChangeObserver: MutationObserver | undefined

// A query that starts after another one finished is counted as waiting on it
export const countQueriesInSequence = (queries: Required<QueryTiming>[]) => {
  const byStart = queries.toSorted((a, b) => a.start - b.start)
  const depths = byStart.map(() => 1)
  byStart.forEach((query, index) => {
    for (let earlier = 0; earlier < index; earlier++) {
      if (byStart[earlier]!.end <= query.start) {
        depths[index] = Math.max(depths[index]!, depths[earlier]! + 1)
      }
    }
  })
  return Math.max(0, ...depths)
}

const flushNavigationTimings = () => {
  clearTimeout(flushTimer)
  flushTimer = undefined
  if (queue.length === 0) return
  const body = JSON.stringify({navigations: queue})
  queue = []
  const blob = new Blob([body], {type: 'text/plain;charset=UTF-8'})
  if (!navigator.sendBeacon(CLIENT_METRICS_URL, blob)) {
    fetch(CLIENT_METRICS_URL, {method: 'POST', body, keepalive: true}).catch(() => {})
  }
}

const enqueue = (timing: NavigationTiming) => {
  window.addEventListener('pagehide', flushNavigationTimings)
  queue.push(timing)
  if (queue.length >= MAX_TIMINGS_PER_BATCH) {
    flushNavigationTimings()
  } else {
    flushTimer ??= setTimeout(flushNavigationTimings, FLUSH_DELAY_MS)
  }
}

const scheduleSettle = (navigation: PendingNavigation) => {
  clearTimeout(navigation.settleTimer)
  navigation.settleTimer = setTimeout(() => settle(navigation), QUIET_MS)
}

const noteChange = (navigation: PendingNavigation) => {
  navigation.lastChangeAt = performance.now()
  scheduleSettle(navigation)
}

const settle = (navigation: PendingNavigation) => {
  if (pendingNavigation !== navigation) return
  const queries = [...navigation.queriesByNetworkRequestId.values()]
  const finishedQueries = queries.filter(
    (query): query is Required<QueryTiming> => query.end !== undefined
  )
  if (finishedQueries.length < queries.length) return
  const isWaitingForFirstQuery =
    navigation.kind === 'load' &&
    queries.length === 0 &&
    performance.now() < MAX_WAIT_FOR_FIRST_QUERY_MS
  if (isWaitingForFirstQuery) {
    scheduleSettle(navigation)
    return
  }
  pendingNavigation = undefined
  pageChangeObserver?.disconnect()
  const {route, kind, start, lastChangeAt, suspendedQueryIds} = navigation
  // a hidden tab renders late, so its timings say nothing about the page
  if (!route || document.visibilityState !== 'visible') return
  const durationMs = Math.round(lastChangeAt - start)
  if (durationMs > MAX_DURATION_MS) return
  enqueue({
    route,
    kind,
    durationMs,
    queriesInSequence: countQueriesInSequence(finishedQueries),
    queryCount: finishedQueries.length,
    suspendedQueries: suspendedQueryIds.size
  })
}

// The first navigation is the page load, so it is timed from the start of the request for the page
export const startNavigation = (route: ReportedRoute | null) => {
  if (pendingNavigation) clearTimeout(pendingNavigation.settleTimer)
  const start = hasLoaded ? performance.now() : 0
  const navigation: PendingNavigation = {
    route,
    kind: hasLoaded ? 'navigate' : 'load',
    start,
    queriesByNetworkRequestId: new Map(),
    suspendedQueryIds: new Set(),
    lastChangeAt: start
  }
  hasLoaded = true
  pendingNavigation = navigation
  pageChangeObserver ??= new MutationObserver(() => {
    if (pendingNavigation) noteChange(pendingNavigation)
  })
  pageChangeObserver.observe(document.body, {subtree: true, childList: true, characterData: true})
  noteChange(navigation)
}

export const logRelayEvent = (event: RelayLogEvent) => {
  const navigation = pendingNavigation
  if (!navigation) return
  switch (event.name) {
    case 'network.start':
      if (event.params.operationKind === 'query') {
        navigation.queriesByNetworkRequestId.set(event.networkRequestId, {start: performance.now()})
      }
      break
    case 'network.complete':
    case 'network.error':
    case 'network.unsubscribe': {
      const query = navigation.queriesByNetworkRequestId.get(event.networkRequestId)
      if (!query || query.end !== undefined) break
      query.end = performance.now()
      noteChange(navigation)
      break
    }
    case 'suspense.query':
      navigation.suspendedQueryIds.add(event.operation.request.identifier)
      break
    case 'suspense.missing_data':
    case 'suspense.fragment':
      for (const {identifier} of event.pendingOperations) {
        navigation.suspendedQueryIds.add(identifier)
      }
      break
  }
}
