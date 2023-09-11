require('./webpack/utils/dotenv')
const pgMigrate = require('node-pg-migrate').default
const cliPgmConfig = require('../packages/server/postgres/pgmConfig')
const path = require('path')
const Redis = require('ioredis')

const migrateRethinkDB = async () => {
  return require('./migrate')()
}

const migratePG = async () => {
  const programmaticPgmConfig = {
    dbClient: cliPgmConfig,
    dir: path.join(__dirname, '..', cliPgmConfig['migrations-dir']),
    direction: 'up',
    migrationsTable: cliPgmConfig['migrations-table']
  }
  return pgMigrate(programmaticPgmConfig)
}

const clearRedis = async () => {
  // Files run by pm2 must be pure JS (not .ts).
  // The RedisInstance (TLS) logic is written in .ts, so we can't use TLS here
  const redis = new Redis(process.env.REDIS_URL, {connectionName: 'devRedis'})
  await redis.flushall()
  redis.disconnect()
}

const migrateDBs = async () => {
  // RethinkDB must be run first because
  // Some PG migrations depemd on the latest state of RethinkDB
  await migrateRethinkDB()
  return migratePG()
}

const runMigrations = async () => {
  await Promise.all([clearRedis(), migrateDBs()])
  setInterval(() => {
    /* keep process from exiting to keep PM2 quiet */
  }, 1 << 30)
}

runMigrations()
