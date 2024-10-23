require('./webpack/utils/dotenv')
const Redis = require('ioredis')

const clearRedis = async () => {
  // Files run by pm2 must be pure JS (not .ts).
  // The RedisInstance (TLS) logic is written in .ts, so we can't use TLS here
  const redis = new Redis(process.env.REDIS_URL, {connectionName: 'devRedis'})
  await redis.flushall()
  redis.disconnect()
}

const runMigrations = async () => {
  await clearRedis()
}

runMigrations()
