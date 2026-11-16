import getRedis from './getRedis'

export async function redisStoreOrNetwork<T extends string | Buffer | number>(
  key: string,
  thunk: () => Promise<T>,
  TTLms: number | (() => number)
): Promise<T> {
  const redis = getRedis()
  const cachedValue = await redis.get(key)
  if (cachedValue !== null) return cachedValue as T
  const networkValue = await thunk()
  const ttl = typeof TTLms === 'function' ? TTLms() : TTLms
  await redis.set(key, networkValue as string, 'PX', ttl)
  return networkValue
}
