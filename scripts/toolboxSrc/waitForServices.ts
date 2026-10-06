import {once} from 'node:events'
import {sql} from 'kysely'
import sleep from '../../packages/client/utils/sleep'
import getKysely from '../../packages/server/postgres/getKysely'
import {Logger} from '../../packages/server/utils/Logger'
import RedisInstance from '../../packages/server/utils/RedisInstance'

const RETRY_INTERVAL_MS = 2000
const TIMEOUT_MS = 120_000

const waitForService = async (serviceName: string, check: () => Promise<unknown>) => {
  const deadline = Date.now() + TIMEOUT_MS
  while (true) {
    try {
      await check()
      return
    } catch (e) {
      if (Date.now() > deadline) {
        throw new Error(`${serviceName} unavailable after ${TIMEOUT_MS / 1000}s`, {cause: e})
      }
      const reason = e instanceof Error ? e.message || (e as NodeJS.ErrnoException).code : e
      Logger.log(`⏳ Waiting for ${serviceName}: ${reason}`)
      await sleep(RETRY_INTERVAL_MS)
    }
  }
}

const connectRedis = async () => {
  const redis = new RedisInstance('preDeploy_waitForServices')
  try {
    await once(redis, 'ready')
  } finally {
    redis.disconnect()
  }
}

const waitForServices = async () => {
  await Promise.all([
    waitForService('Postgres', () => sql`SELECT 1`.execute(getKysely())),
    waitForService('Redis', connectRedis)
  ])
}

export default waitForServices
