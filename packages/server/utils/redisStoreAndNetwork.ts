import {createHash} from 'node:crypto'
import stringify from 'fast-json-stable-stringify'
import ms from 'ms'
import {pack, unpack} from 'msgpackr'
import getRedis from './getRedis'
import {Logger} from './Logger'

interface CachedEntry<T> {
  rawHash: Buffer
  transformedPayload: T
  cachedAt: number
}

const DEFAULT_MAX_AGE = ms('3s')
const DEFAULT_TTL = ms('1d')

function hashRaw(raw: object): Buffer {
  return createHash('sha256').update(stringify(raw)).digest()
}

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
  const cached = await redis.getBuffer(key)

  if (cached !== null) {
    const entry = unpack(cached) as CachedEntry<TTransformed>
    const isStale = Date.now() - entry.cachedAt > maxAge
    if (isStale) {
      refresh(key, thunk, transform, ttl, entry.rawHash, onUpdate).catch(Logger.error)
    }
    return entry.transformedPayload
  }

  const raw = await thunk()
  if (raw instanceof Error) return raw

  try {
    const rawHash = hashRaw(raw)
    const transformedPayload = await transform(raw)
    const entry: CachedEntry<TTransformed> = {rawHash, transformedPayload, cachedAt: Date.now()}
    redis.set(key, pack(entry), 'PX', ttl)
    return transformedPayload
  } catch (e) {
    return e instanceof Error ? e : new Error('Transform failed')
  }
}
