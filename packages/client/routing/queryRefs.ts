import {loadQuery, type PreloadedQuery} from 'react-relay'
import {
  type ConcreteRequest,
  type FetchPolicy,
  fetchQuery,
  getRequestIdentifier,
  type IEnvironment,
  type OperationType,
  type VariablesOf
} from 'relay-runtime'
import {addBreadcrumb} from '../utils/clientBreadcrumbs'

const UNSHOWN_IDLE_MS = 30_000
// A query a page showed outlives the page, so going back renders from the store
const SHOWN_IDLE_MS = 5 * 60_000
const MAX_IDLE_QUERIES = 50
const SWEEP_INTERVAL_MS = 30_000

// Relay 21's loadQuery returns releaseQuery, but its typings leave it out
type ReleasableQueryRef = PreloadedQuery<OperationType> & {releaseQuery: () => void}

interface QueryRefEntry {
  key: string
  query: ConcreteRequest
  queryRef: ReleasableQueryRef
  fetchPolicy: FetchPolicy
  leases: number
  wasShown: boolean
  idleSince: number
  isSettled: boolean
  hasFailed: boolean
}

interface LoadOptions {
  fetchPolicy?: FetchPolicy
}

export type QueryRefs = ReturnType<typeof createQueryRefs>

// Owns every route query: one reference per query and variables, held while a page shows it and released once idle
export const createQueryRefs = (environment: IEnvironment, reconnectHandlers: Set<() => void>) => {
  const entries = new Map<string, QueryRefEntry>()
  const entriesByQueryRef = new WeakMap<object, QueryRefEntry>()
  let isSweepScheduled = false

  // releaseQuery lets a request still in flight land in the store, where dispose would cancel it
  const release = (entry: QueryRefEntry) => {
    if (entries.get(entry.key) === entry) entries.delete(entry.key)
    entry.queryRef.releaseQuery()
  }

  const sweep = () => {
    const now = Date.now()
    const idleEntries = [...entries.values()].filter((entry) => entry.leases === 0)
    const keptEntries = idleEntries.filter((entry) => {
      const maxIdleMs = entry.wasShown ? SHOWN_IDLE_MS : UNSHOWN_IDLE_MS
      if (now - entry.idleSince < maxIdleMs) return true
      release(entry)
      return false
    })
    keptEntries
      .sort((a, b) => a.idleSince - b.idleSince)
      .slice(0, Math.max(0, keptEntries.length - MAX_IDLE_QUERIES))
      .forEach(release)
  }

  const start = (
    key: string,
    query: ConcreteRequest,
    variables: VariablesOf<OperationType>,
    fetchPolicy: FetchPolicy
  ) => {
    const queryRef = loadQuery(environment, query, variables, {fetchPolicy}) as ReleasableQueryRef
    const entry: QueryRefEntry = {
      key,
      query,
      queryRef,
      fetchPolicy,
      leases: 0,
      wasShown: false,
      idleSince: Date.now(),
      isSettled: !queryRef.source,
      hasFailed: false
    }
    queryRef.source?.subscribe({
      complete: () => {
        entry.isSettled = true
      },
      error: () => {
        entry.isSettled = true
        entry.hasFailed = true
      }
    })
    entries.set(key, entry)
    entriesByQueryRef.set(queryRef, entry)
    return entry
  }

  // A page still showing the replaced reference keeps it until the page closes
  const replace = (entry: QueryRefEntry) => {
    entries.delete(entry.key)
    if (entry.leases === 0) entry.queryRef.releaseQuery()
  }

  // Resolves on the query's first payload, so the router keeps the old page up until the new one has data
  const load = async <TQuery extends OperationType>(
    query: ConcreteRequest,
    variables: VariablesOf<TQuery>,
    {fetchPolicy = 'store-or-network'}: LoadOptions = {}
  ) => {
    if (!isSweepScheduled) {
      isSweepScheduled = true
      setInterval(sweep, SWEEP_INTERVAL_MS)
    }
    const key = getRequestIdentifier(query.params, variables)
    const existing = entries.get(key)
    // network-only joins a request in flight, never one that already answered
    const canJoin =
      existing &&
      !existing.queryRef.isDisposed &&
      !existing.hasFailed &&
      (fetchPolicy !== 'network-only' || !existing.isSettled)
    if (existing && !canJoin) replace(existing)
    const entry = existing && canJoin ? existing : start(key, query, variables, fetchPolicy)
    entry.idleSince = Date.now()
    await entry.queryRef.source?.toPromise()
    return entry.queryRef as PreloadedQuery<TQuery>
  }

  const lease = <TQuery extends OperationType>(queryRef: PreloadedQuery<TQuery>) => {
    const entry = entriesByQueryRef.get(queryRef)
    if (!entry) return () => {}
    entry.leases++
    entry.wasShown = true
    return () => {
      entry.leases--
      entry.idleSince = Date.now()
      if (entry.leases === 0 && entries.get(entry.key) !== entry) entry.queryRef.releaseQuery()
    }
  }

  // After a reconnect, a shown page refreshes in place and keeps what it has if the refresh fails.
  // A store-only reference shows what its owner fetched, like a joined meeting, so the owner refreshes it
  const refetchShown = () => {
    entries.forEach(({leases, query, queryRef, fetchPolicy}) => {
      if (leases === 0 || fetchPolicy === 'store-only') return
      fetchQuery(environment, query, queryRef.variables, {fetchPolicy: 'network-only'}).subscribe({
        error: () => {
          addBreadcrumb('operation', `${query.params.name} did not refresh after reconnecting`)
        }
      })
    })
  }
  reconnectHandlers.add(refetchShown)

  return {load, lease, sweep}
}
