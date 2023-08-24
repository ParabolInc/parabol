import Redis from 'ioredis'
import {getRedisOptions} from './getRedisOptions'

// options in outer scope to read from fs only once
const options = getRedisOptions()

export default class RedisInstance extends Redis {
  constructor(connectionName: string) {
    super(process.env.REDIS_URL!, {connectionName, ...options})
  }
}
