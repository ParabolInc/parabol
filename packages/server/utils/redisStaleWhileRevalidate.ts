import getRedis from './getRedis'
import {Logger} from './Logger'
import RedisLock from './RedisLock'

const JITTER = 0.2

// The thunk may make two sequential fetchUntrusted calls, each with a 15s timeout, so
// the lock has to outlive the slowest realistic fetch or it expires mid-flight and
// stops collapsing concurrent callers.
const DEFAULT_LOCK_TTL_MS = 35_000
const DEFAULT_MAX_WAIT_MS = 5_000

/** Spread expiries so entries written together do not all expire in the same second. */
const jitterTTL = (ttlMs: number) => Math.round(ttlMs * (1 + (Math.random() * 2 - 1) * JITTER))

const readCached = async <T>(key: string): Promise<T | undefined> => {
  const cached = await getRedis().get(key)
  if (cached === null) return undefined
  try {
    return JSON.parse(cached) as T
  } catch {
    // A corrupt entry must not fail the request; fall through and refetch
    Logger.debug(`discarding unparseable cache entry ${key}`)
    return undefined
  }
}

/**
 * Like redisStoreOrNetwork, but adds the two things it lacks: a single-flight lock so
 * concurrent misses collapse into one upstream call, and TTL jitter. Kept separate
 * because existing redisStoreOrNetwork callers depend on its current behavior.
 */
export const redisStaleWhileRevalidate = async <T>(
  key: string,
  thunk: () => Promise<T>,
  ttlMs: number | ((value: T) => number),
  options?: {lockTtlMs?: number; maxWaitMs?: number; refresh?: boolean}
): Promise<T> => {
  const refresh = options?.refresh ?? false
  if (!refresh) {
    const cached = await readCached<T>(key)
    if (cached !== undefined) return cached
  }

  const maxWaitMs = options?.maxWaitMs ?? DEFAULT_MAX_WAIT_MS
  const lock = new RedisLock(`swr:${key}`, options?.lockTtlMs ?? DEFAULT_LOCK_TTL_MS)
  let hasLock = true
  try {
    await lock.lock(maxWaitMs)
  } catch {
    // Someone else is fetching and is taking longer than we will wait. Fetch ourselves
    // rather than failing, but do not release a lock we never acquired.
    hasLock = false
  }
  try {
    if (hasLock && !refresh) {
      // The previous holder may have populated the key while we waited
      const afterLock = await readCached<T>(key)
      if (afterLock !== undefined) return afterLock
    }
    const value = await thunk()
    const resolvedTtlMs = typeof ttlMs === 'function' ? ttlMs(value) : ttlMs
    await getRedis().set(key, JSON.stringify(value), 'PX', jitterTTL(resolvedTtlMs))
    return value
  } finally {
    if (hasLock) await lock.unlock()
  }
}
