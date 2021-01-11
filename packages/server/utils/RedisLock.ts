import generateUID from '../generateUID'
import getRedis from './getRedis'

export default class RedisLock {
  value = generateUID()
  key: string
  ttl: number
  redis = getRedis()

  constructor(key: string, ttl: number) {
    this.key = `lock:${key}`
    this.ttl = ttl
  }

  lock = async () => {
    // returns time left until key expires. 0 means it doesn't exist
    const res = await this.redis.set(this.key, this.value, 'PX', this.ttl, 'NX')
    if (res === 'OK') return -1
    return this.redis.pttl(this.key)
  }

  unlock = async () => {
    const activeValue = await this.redis.get(this.key)
    if (activeValue === this.value) {
      await this.redis.del(this.key)
      return true
    }
    return undefined
  }
}
