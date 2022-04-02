require('./webpack/utils/dotenv')
const pgMigrate = require('node-pg-migrate').default
const cliPgmConfig = require('../packages/server/postgres/pgmConfig')
const Redis = require('ioredis')
const path = require('path')

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
  return Promise.all([clearRedis(), migrateDBs()])
}

runMigrations()
