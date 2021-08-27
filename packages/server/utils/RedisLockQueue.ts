import sleep from '../../client/utils/sleep'
import generateUID from '../generateUID'
import getRedis from './getRedis'

export default class RedisLockQueue {
  uid = `${generateUID()}.${Date.now()}`
  queueKey: string
  waitTimeMs: number
  ttl: number
  queued = false
  timeoutId: NodeJS.Timeout | undefined
  redis = getRedis()

  // Check lock every 100 ms
  private static readonly checkAfterMs = 100

  constructor(key: string, ttl: number) {
    this.queueKey = `lock:queue:${key}`
    this.ttl = ttl
    this.waitTimeMs = 0
  }

  unlock = async () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    // Extend list TTL
    await this.redis.pexpire(this.queueKey, this.ttl + RedisLockQueue.checkAfterMs)
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
        .pexpire(this.queueKey, this.ttl + RedisLockQueue.checkAfterMs)
        .exec()
      this.queued = true
      const resultingListLength = res[0][1]
      // If the resulting LIST length is 1, we're already first on the list, return no lock
      return resultingListLength !== 1
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
      const newTTL = await this.redis.pexpire(this.queueKey, this.ttl + RedisLockQueue.checkAfterMs)
      if (newTTL === 0) {
        // TTL was not set because queue disappeared
        throw new Error(`Could not achieve lock for ${this.queueKey}. Unable to set TTL`)
      }
      return false
    } else {
      // Check if head expired
      // and remove all items that are also expired (server crash prevention)
      let checkHead = head
      let allExpiredHeadsRemoved = false
      while (!allExpiredHeadsRemoved) {
        const headCreatedAtMs = parseInt(checkHead.split('.')[1], 10)
        if (headCreatedAtMs < Date.now() - this.ttl) {
          await this.redis.lrem(this.queueKey, 0, checkHead)
          checkHead = await this.redis.lindex(this.queueKey, 0)
          if (checkHead == null) {
            // No more items left in the list
            allExpiredHeadsRemoved = true
          }
        } else {
          allExpiredHeadsRemoved = true
        }
      }
    }
    return true
  }

  lock = async (maxWaitMs: number) => {
    // "Infinity" loop
    for (let i = 0; i < 1000; i++) {
      const hasLock = await this.checkLock()
      if (!hasLock) {
        this.timeoutId = setTimeout(() => this.unlock(), this.ttl)
        return
      } else {
        await sleep(RedisLockQueue.checkAfterMs)
        this.waitTimeMs += RedisLockQueue.checkAfterMs
        if (this.waitTimeMs > maxWaitMs) {
          // Remove event from the queue
          await this.unlock()
          throw new Error(`Could not achieve lock for ${this.queueKey} after ${maxWaitMs}ms`)
        }
      }
    }
  }
}
