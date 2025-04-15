import ms from 'ms'
import Redlock from 'redlock'
import RedisInstance from './utils/RedisInstance'

export const establishPrimaryServer = async (redis: RedisInstance, prefix: string) => {
  const redlock = new Redlock([redis], {retryCount: 0})
  const MAX_TIME_BETWEEN_WORKER_STARTUPS = ms('30s')
  try {
    const primaryWorkerLock = await redlock.acquire(
      [`${prefix}_isPrimary_${__APP_VERSION__}`],
      MAX_TIME_BETWEEN_WORKER_STARTUPS
    )
    return primaryWorkerLock
  } catch {
    return undefined
  }
}
