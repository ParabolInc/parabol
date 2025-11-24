import getRedis from './getRedis'

export async function redisStoreOrNetwork<T extends string | Buffer | number>(
  key: string,
  thunk: () => Promise<T>,
  TTLms: number
): Promise<T> {
  const redis = getRedis()
  const cachedValue = await redis.get(key)
  if (cachedValue !== null) return cachedValue as T
  const networkValue = await thunk()
  await redis.set(key, networkValue as string, 'PX', TTLms)
  return networkValue
}
