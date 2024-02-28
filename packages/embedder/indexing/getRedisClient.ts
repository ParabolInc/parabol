import RedisInstance from 'parabol-server/utils/RedisInstance'

const {SERVER_ID} = process.env

let redisClient: RedisInstance
export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new RedisInstance(`embedder-${SERVER_ID}`)
  }
  return redisClient
}
