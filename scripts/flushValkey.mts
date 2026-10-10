import './webpack/utils/dotenv.js'
import {Redis} from 'ioredis'

const flushValkey = async () => {
  const {REDIS_URL} = process.env
  if (!REDIS_URL) throw new Error('REDIS_URL must be set in .env')
  // The server's RedisInstance adds TLS, but it is app code that node cannot run by itself, so there is no TLS here
  const redis = new Redis(REDIS_URL, {connectionName: 'devRedis'})
  // only the db in REDIS_URL, because an isolated stack shares the server with other stacks
  await redis.flushdb()
  redis.disconnect()
}

flushValkey()
