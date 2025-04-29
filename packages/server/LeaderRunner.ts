import Redlock, {type Lock} from 'redlock'
import type RedisInstance from './utils/RedisInstance'

export type LeaderRunnable = () => Promise<void> | void

export class LeaderRunner {
  redis: RedisInstance
  redlock: Redlock
  prefix: string
  lockTTL: number
  lock: Lock | null = null

  constructor(redis: RedisInstance, prefix: string, lockTTL: number) {
    this.redis = redis
    this.redlock = new Redlock([this.redis], {retryCount: 0})
    this.prefix = prefix
    this.lockTTL = lockTTL
  }

  async runLocked(name: string, run: LeaderRunnable, skip: LeaderRunnable) {
    try {
      await this.redlock.using([`${this.prefix}_${name}`], this.lockTTL, async () => {
        await run()
      })
    } catch {
      await skip()
    }
  }
}
