import RedisInstance from 'parabol-server/utils/RedisInstance'

const KEY = 'embedder:high_priority_active'

/*
 * A simple priority lock for embedding jobs.
 *
 * Allows high priority jobs (e.g. search) to run while jobs related
 * to embedding new/updated objects are paused.
 */
export class PriorityLock {
  redis: RedisInstance
  constructor(redis: RedisInstance) {
    this.redis = redis
  }

  async acquireHighPriority(ttlMs: number) {
    if (ttlMs <= 0) return
    await this.redis.set(KEY, '1', 'PX', ttlMs)
  }

  async releaseHighPriority() {
    await this.redis.del(KEY)
  }

  async waitForLowPriority(checkIntervalMs: number = 100) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const isHighPriority = await this.redis.get(KEY)
      if (!isHighPriority) {
        return
      }
      await new Promise((resolve) => setTimeout(resolve, checkIntervalMs))
    }
  }
}
