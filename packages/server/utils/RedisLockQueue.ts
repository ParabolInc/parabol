import sleep from '../../client/utils/sleep'
import generateUID from '../generateUID'
import getRedis from './getRedis'

export default class RedisLockQueue {
  uid = generateUID()
  uidWithTimestamp: string | undefined
  queueKey: string
  waitTimeMs: number
  ttl: number
  queued = false
  timeoutId: NodeJS.Timeout | undefined
  uidToFlush = ''
  redis = getRedis()

  // Check lock every 100 ms
  private static readonly checkAfterMs = 100
  private static readonly timestampDelimiter = '::'

  constructor(key: string, ttl: number) {
    this.queueKey = `lock:queue:${key}`
    this.ttl = ttl
    this.waitTimeMs = 0
  }

  unlock = async () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    // Remove all occurrences of the event from the list
    return this.redis.lrem(this.queueKey, 0, this.uidWithTimestamp ?? this.uid)
  }

  private markTaskAsRunning = async () => {
    // Append a timestamp to uid and replace the head
    this.uidWithTimestamp = `${this.uid}::${Date.now()}`
    return this.redis.lset(this.queueKey, 0, this.uidWithTimestamp)
  }

  // Removes the head
  private flushHead = async () => {
    return this.redis.lpop(this.queueKey)
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
    if (head == null) {
      // If no head element exists, the queue was removed for some reason
      // Now we cannot guarantee the correct order of the event
      throw new Error(`Could not achieve lock for ${this.queueKey}. Queue does not exists`)
    }

    const headUid = head.split(RedisLockQueue.timestampDelimiter)[0]
    if (headUid === this.uid) {
      return false
    } else {
      // Check if head is expired or not started
      const uidToFlush = this.uidToFlush
      this.uidToFlush = ''
      if (head === uidToFlush) {
        // we already gave the other process 100ms to pick up the task and it didn't. it's stale.
        await this.flushHead()
      } else {
        const delimiterIdx = head.lastIndexOf(RedisLockQueue.timestampDelimiter)
        if (delimiterIdx === -1) {
          // the head hasn't started working yet, give it 100ms to start
          this.uidToFlush = head
        } else if (
          parseInt(head.slice(delimiterIdx + RedisLockQueue.timestampDelimiter.length), 10) <
          Date.now() - this.ttl
        ) {
          // the other process has been working for > ttl, it's stale
          await this.flushHead()
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
        this.timeoutId = setTimeout(() => this.unlock(), this.ttl)
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
