import Redis from 'ioredis'
import {getRedisSSL} from './getRedisSSL'
export default class RedisInstance extends Redis {
  constructor(connectionName: string) {
    const {REDIS_URL, REDIS_PASSWORD} = process.env
    if (!REDIS_URL) throw new Error('Env Var REDIS_URL is not defined')
    const redisUrl = REDIS_URL.toLowerCase()
    const tls = getRedisSSL()
    const isURLSSL = redisUrl.startsWith('rediss')
    if (!tls && isURLSSL)
      throw new Error('Env Var REDIS_URL proto is rediss:// but TLS certs were not found')
    if (tls && !isURLSSL)
      throw new Error('Env Var REDIS_URL proto should be rediss:// if using TLS certs')
    const password = REDIS_PASSWORD || undefined
    super(REDIS_URL, {connectionName, tls, password})
  }
}
