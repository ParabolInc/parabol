import Redis from 'ioredis'

let redis: Redis.Redis
const getRedis = () => {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL)
  }
  return redis
}
export default getRedis
