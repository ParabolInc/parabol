import ms from 'ms'
import RedisInstance from 'parabol-server/utils/RedisInstance'
import Redlock from 'redlock'

export const establishPrimaryEmbedder = async (redis: RedisInstance) => {
  const redlock = new Redlock([redis], {retryCount: 0})
  const MAX_TIME_BETWEEN_WORKER_STARTUPS = ms('5s')
  try {
    const primaryWorkerLock = await redlock.acquire(
      [`embedder_isPrimary_${process.env.npm_package_version}`],
      MAX_TIME_BETWEEN_WORKER_STARTUPS
    )
    return primaryWorkerLock
  } catch {
    return undefined
  }
}
