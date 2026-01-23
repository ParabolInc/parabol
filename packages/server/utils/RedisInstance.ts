import Redis from 'ioredis'
import {getRedisOptions} from './getRedisOptions'

// options in outer scope to read from fs only once
const options = getRedisOptions()

export default class RedisInstance extends Redis {
  constructor(connectionName: string) {
    super(process.env.REDIS_URL!, {
      connectionName,
      ...options,
      // https://github.com/redis/ioredis/issues/2037
      // EmbeddingsJobQueueStream_sub calls subscribe before the driver calls INFO as a ready check
      // Since subscribers can't call INFO this would otherwise break, especially in dev on quick server restarts
      enableReadyCheck: !connectionName.endsWith('sub')
    })
  }
}
