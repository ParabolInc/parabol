import Redis from 'ioredis'
import getDotenv from '../../server/utils/dotenv'

getDotenv()

let redis: Redis.Redis
const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL)
  }
  return redis
}
export default getRedis
