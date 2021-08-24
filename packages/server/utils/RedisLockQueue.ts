import sleep from '../../client/utils/sleep'
import generateUID from '../generateUID'
import getRedis from './getRedis'

export default class RedisLockQueue {
  uid = generateUID()
  queueKey: string
  waitTime: number
  ttl: number
  queued = false
  redis = getRedis()

  constructor(key: string, ttl: number) {
    this.queueKey = `lock:queue:${key}`
    this.ttl = ttl
    this.waitTime = 0
  }

  unlock = async () => {
    // Remove all occurrences of the event from the list
    return this.redis.lrem(this.queueKey, 0, this.uid)
  }

  checkLock = async () => {
    // Add an event to the queue only once
    if (!this.queued) {
      // Use transaction to add an event to the queue and set initial LIST TTL
      const res = await this.redis
        .multi()
        .rpush(this.queueKey, this.uid)
        // TODO: Use NX option to set TTL only on LIST creation (Redis 7.0 required)
        .pexpire(this.queueKey, this.ttl)
        .exec()
      this.queued = true
      const resultingListLength = res[0][1]
      if (resultingListLength === 1) {
        // If the resulting LIST length is 1, we're already first on the list, return no lock
        return false
      }
    }
    // Checking if we are the first on the list
    const head = await this.redis.lindex(this.queueKey, 0)
    if (head == null) {
      // If no head element exists, the queue was removed for some reason
      // Now we cannot guarantee the correct order of the event
      throw new Error(`Could not achieve lock for ${this.queueKey}. Queue does not exists`)
    }
    if (head === this.uid) {
      // We are the first on the list, no lock
      // Refresh TTL on the LIST before running the event
      const newTTL = await this.redis.pexpire(this.queueKey, this.ttl)
      if (newTTL === 0) {
        // TTL was not set because queue disappeared
        throw new Error(`Could not achieve lock for ${this.queueKey}. Unable to set TTL`)
      }
      return false
    }
    return true
  }

  lock = async (maxWait: number) => {
    // Check lock every 100 ms
    const checkAfterMs = 100
    // "Infinity" loop
    for (let i = 0; i < 1000; i++) {
      const hasLock = await this.checkLock()
      if (!hasLock) {
        return
      } else {
        await sleep(checkAfterMs)
        this.waitTime += checkAfterMs
        if (this.waitTime > maxWait) {
          // Remove event from the queue
          await this.unlock()
          throw new Error(`Could not achieve lock for ${this.queueKey} after ${maxWait}ms`)
        }
      }
    }
  }
}
