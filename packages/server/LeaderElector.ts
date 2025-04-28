import {EventEmitter} from 'node:events'
import Redlock, {type Lock} from 'redlock'
import {Logger} from './utils/Logger'
import type RedisInstance from './utils/RedisInstance'

type LeaderElectorEvents = {
  elected: []
  revoked: []
  renewed: []
}

export class LeaderElector extends EventEmitter<LeaderElectorEvents> {
  redis: RedisInstance
  redlock: Redlock
  lockKey: string
  lockTTL: number
  lock: Lock | null = null
  renewTimer: NodeJS.Timeout | undefined = undefined
  running: boolean = false
  constructor(redis: RedisInstance, prefix: string, lockTTL: number) {
    super()
    this.redis = redis
    this.redlock = new Redlock([this.redis], {retryCount: -1})
    this.lockKey = `${prefix}_leaderElector`
    this.lockTTL = lockTTL
  }

  async start() {
    this.running = true
    await this.tryAcquireLock()
  }

  async stop() {
    this.running = false
    clearInterval(this.renewTimer)
    if (this.lock) {
      try {
        await this.lock.release()
      } catch (e) {
        Logger.error('Failed to unlock cleanly:', e)
      }
      this.lock = null
    }
    await this.redis.quit()
  }

  private async tryAcquireLock() {
    if (!this.running) return

    try {
      this.lock = await this.redlock.acquire([this.lockKey], this.lockTTL)
      this.emit('elected')

      this.renewTimer = setInterval(() => this.renewLock(), this.lockTTL / 2)
    } catch (err) {
      Logger.log('❌ Failed to acquire lock, retrying...')
      setTimeout(() => this.tryAcquireLock(), 3000)
    }
  }

  private async renewLock() {
    if (!this.lock) return

    try {
      this.lock = await this.lock.extend(this.lockTTL)
      this.emit('renewed')
    } catch (e) {
      console.error('💥 Failed to extend lock:', e)
      this.loseLeadership()
    }
  }

  private loseLeadership() {
    if (this.lock) {
      this.emit('revoked')
      clearInterval(this.renewTimer)
      this.lock = null
      console.log('⚠️ Lost leadership, will try to re-acquire')
      setTimeout(() => this.tryAcquireLock(), 3000)
    }
  }
}
