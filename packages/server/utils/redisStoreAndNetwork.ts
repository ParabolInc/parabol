import {createHash} from 'node:crypto'
import stringify from 'fast-json-stable-stringify'
import ms from 'ms'
import {pack, unpack} from 'msgpackr'
import sleep from 'parabol-client/utils/sleep'
import getRedis from './getRedis'
import {Logger} from './Logger'

interface CachedEntry<T> {
  rawHash: Buffer
  transformedPayload: T
  cachedAt: number
}

const DEFAULT_MAX_AGE = ms('3s')
const DEFAULT_TTL = ms('1d')
// Slightly longer than the 20s deadline in fetchWithRetry so it auto-expires on process crash
const PENDING_TTL_MS = 25_000
const POLL_INTERVAL_MS = 50

// A sentinel stored in Redis while a fetch is in progress so concurrent requests wait instead of
// all racing to Jira at once.
const PENDING = Buffer.from('__pending__')

function isPending(buf: Buffer): boolean {
  return buf.equals(PENDING)
}

function hashRaw(raw: object): Buffer {
  return createHash('sha256').update(stringify(raw)).digest()
}

// Polls until the key holds a real CachedEntry or the pending TTL elapses.
// Returns null on timeout (caller should fall back to fetching directly).
async function waitForValue<T>(key: string): Promise<CachedEntry<T> | null> {
  const redis = getRedis()
  const giveUpAt = Date.now() + PENDING_TTL_MS
  while (Date.now() < giveUpAt) {
    await sleep(POLL_INTERVAL_MS)
    const buf = await redis.getBuffer(key)
    if (buf !== null && !isPending(buf)) {
      return unpack(buf) as CachedEntry<T>
    }
    // buf === null means the pending marker expired (process crash) — stop waiting
    if (buf === null) break
  }
  return null
}

// Background re-fetch: only writes to Redis and calls onUpdate when the raw payload changed.
async function refresh<TRaw extends object, TTransformed>(
  key: string,
  thunk: () => Promise<TRaw | Error>,
  transform: (raw: TRaw) => TTransformed | Promise<TTransformed>,
  ttl: number,
  cachedRawHash: Buffer,
  onUpdate: ((transformed: TTransformed) => void | Promise<void>) | undefined
): Promise<void> {
  const raw = await thunk()
  if (raw instanceof Error) return
  const newHash = hashRaw(raw)
  if (newHash.equals(cachedRawHash)) return
  const transformedPayload = await transform(raw)
  const entry: CachedEntry<TTransformed> = {
    rawHash: newHash,
    transformedPayload,
    cachedAt: Date.now()
  }
  const redis = getRedis()
  redis.set(key, pack(entry), 'PX', ttl)
  if (onUpdate) await onUpdate(transformedPayload)
}

// Fetches via thunk, transforms, and writes the real entry to Redis.
// Deletes the key (releasing any pending waiter) on failure.
async function fetchAndStore<TRaw extends object, TTransformed>(
  key: string,
  thunk: () => Promise<TRaw | Error>,
  transform: (raw: TRaw) => TTransformed | Promise<TTransformed>,
  ttl: number
): Promise<TTransformed | Error> {
  const redis = getRedis()
  const raw = await thunk()
  if (raw instanceof Error) {
    redis.del(key)
    return raw
  }
  try {
    const rawHash = hashRaw(raw)
    const transformedPayload = await transform(raw)
    const entry: CachedEntry<TTransformed> = {rawHash, transformedPayload, cachedAt: Date.now()}
    redis.set(key, pack(entry), 'PX', ttl)
    return transformedPayload
  } catch (e) {
    redis.del(key)
    return e instanceof Error ? e : new Error('Transform failed')
  }
}

export async function redisStoreAndNetwork<TRaw extends object, TTransformed>(
  key: string,
  thunk: () => Promise<TRaw | Error>,
  transform: (raw: TRaw) => TTransformed | Promise<TTransformed>,
  options?: {
    maxAge?: number
    ttl?: number
    onUpdate?: (transformed: TTransformed) => void | Promise<void>
  }
): Promise<TTransformed | Error> {
  const {maxAge = DEFAULT_MAX_AGE, ttl = DEFAULT_TTL, onUpdate} = options ?? {}
  const redis = getRedis()

  // Atomically get the current value and claim the key with a PENDING sentinel if it's empty.
  // SET key PENDING PX ttl NX GET returns:
  //   null   → key was empty, we claimed it → we must fetch
  //   Buffer → key already had a value (real entry or PENDING from another request)
  const prev = await redis.setBuffer(key, PENDING, 'PX', PENDING_TTL_MS, 'NX', 'GET')

  // this is the first request for this key
  if (prev === null) return fetchAndStore(key, thunk, transform, ttl)

  if (isPending(prev)) {
    // Another request is already fetching — wait for it to finish
    const entry = await waitForValue<TTransformed>(key)
    if (entry !== null) return entry.transformedPayload
    // Timed out (process probably crashed) — fetch directly
    return fetchAndStore(key, thunk, transform, ttl)
  } else {
    // Cache hit — unpack the real entry, return immediately, refresh in background if stale
    const entry = unpack(prev) as CachedEntry<TTransformed>
    if (Date.now() - entry.cachedAt > maxAge) {
      refresh(key, thunk, transform, ttl, entry.rawHash, onUpdate).catch(Logger.error)
    }
    return entry.transformedPayload
  }
}
