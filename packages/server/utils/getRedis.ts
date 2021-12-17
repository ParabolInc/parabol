import Redis from 'ioredis'

let redis: Redis.Redis
const getRedis = () => {
  if (!redis) {
    redis = new Redis(Number(process.env.REDIS_PORT), process.env.REDIS_URL, {
      connectionName: 'getRedis'
    })
  }
  return redis
}
export default getRedis
