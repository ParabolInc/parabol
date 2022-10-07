import Redis from 'ioredis'

let redis: Redis
type RedisPipelineError = [Error, null]
type RedisPipelineSuccess<T> = [null, T]
export type RedisPipelineResponse<TSuccess> = RedisPipelineError | RedisPipelineSuccess<TSuccess>

const getRedis = () => {
  if (!redis) {
    redis = new Redis(6379, process.env.REDIS_URL!, {connectionName: 'getRedis'})
  }
  return redis
}
export default getRedis
