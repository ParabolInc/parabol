import Redis from 'ioredis'
import RedisInstance from './RedisInstance'

let redis: Redis
type RedisPipelineError = [Error, null]
type RedisPipelineSuccess<T> = [null, T]
export type RedisPipelineResponse<TSuccess> = RedisPipelineError | RedisPipelineSuccess<TSuccess>

const getRedis = () => {
  if (!redis) {
    redis = new RedisInstance('getRedis')
  }
  return redis
}
export default getRedis
