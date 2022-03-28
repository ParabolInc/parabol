import sleep from '../../client/utils/sleep'
import generateUID from '../generateUID'
import getRedis from './getRedis'

export default class RedisLockQueue {
  uid = generateUID()
  uidWithTimestamp: string | undefined
  queueKey: string
  waitTimeMs: number
  ttlMs: number
  queued = false
  timeoutId: NodeJS.Timeout | undefined
  uidToFlush = ''
  redis = getRedis()

  // Check lock every 100 ms
  private static readonly checkAfterMs = 100
  private static readonly timestampDelimiter = '::'

  constructor(key: string, ttlMs: number) {
    this.queueKey = `lock:queue:${key}`
    this.ttlMs = ttlMs
    this.waitTimeMs = 0
  }

  private removeItem = async (item: string) => {
    return this.redis.lrem(this.queueKey, 0, item)
  }

  unlock = async () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    return this.removeItem(this.uidWithTimestamp ?? this.uid)
  }

  private markTaskAsRunning = async () => {
    // Append a timestamp to uid and replace the head
    this.uidWithTimestamp = `${this.uid}::${Date.now()}`
    return this.redis.lset(this.queueKey, 0, this.uidWithTimestamp)
  }

  private setLockAndValidateQueue = async () => {
    // Add an event to the queue only once
    if (!this.queued) {
      const resultingListLength = await this.redis.rpush(this.queueKey, this.uid)
      this.queued = true
      // If the resulting LIST length is 1, we're already first on the list, return no lock
      return resultingListLength !== 1
    }
    // Checking if we are the first on the list
    const head = await this.redis.lindex(this.queueKey, 0)
    if (head === null) {
      // Queue disappeared for some reason, try again
      this.queued = false
      return true
    }

    const [, headTimestamp] = head.split(RedisLockQueue.timestampDelimiter)
    if (head === this.uid) {
      return false
    } else {
      // Check if head is expired or not started
      const uidToFlush = this.uidToFlush
      this.uidToFlush = ''
      if (head === uidToFlush) {
        // we already gave the other process 100ms to pick up the task and it didn't. it's stale.
        await this.removeItem(head)
      } else {
        if (!headTimestamp) {
          // the head hasn't started working yet, give it 100ms to start
          this.uidToFlush = head
        } else if (parseInt(headTimestamp, 10) < Date.now() - this.ttlMs) {
          // the other process has been working for > ttl, it's stale
          await this.removeItem(head)
        }
      }
      return true
    }
  }

  lock = async (maxWaitMs: number) => {
    // "Infinity" loop
    for (let i = 0; i < 1000; i++) {
      const hasLock = await this.setLockAndValidateQueue()
      if (!hasLock) {
        this.timeoutId = setTimeout(() => this.unlock(), this.ttlMs)
        await this.markTaskAsRunning()
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
