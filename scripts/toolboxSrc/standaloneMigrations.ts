// Should roughly match runMigrations.js except it isn't run in PM2 in dev
// This file is bundled by webpack into a small migrate.js file which includes all migration files & their deps
// It is used by PPMIs who are only provided with the bundles
import path from 'path'
import {r} from 'rethinkdb-ts'
import {parse} from 'url'
import cliPgmConfig from '../../packages/server/postgres/pgmConfig'
import '../webpack/utils/dotenv'
import pgEnsureExtensions from './pgEnsureExtensions'
import pgMigrate from './pgMigrateRunner'
import * as rethinkMigrate from './rethinkMigrateRunner'

const migrateRethinkDB = async () => {
  console.log('👴 RethinkDB Migration Started')
  const {hostname, port, path: urlPath} = parse(process.env.RETHINKDB_URL!)
  process.env.host = hostname!
  process.env.port = port!
  process.env.db = urlPath!.slice(1)
  process.env.r = process.cwd()
  const context = (require as any).context(
    '../../packages/server/database/migrations',
    false,
    /.(js|ts)$/
  )
  const collector = {}
  context.keys().forEach((relativePath) => {
    const {name} = path.parse(relativePath)
    collector[name] = context(relativePath)
  })
  await rethinkMigrate.up({all: true, migrations: collector})
  console.log('👴 RethinkDB Migration Complete')
}

const migratePG = async () => {
  console.log('🐘 Postgres Migration Started')
  await pgEnsureExtensions()
  // pgm uses a dynamic require statement, which doesn't work with webpack
  // if we ignore that dynamic require, we'd still have to include the migrations directory AND any dependencies it might have
  // by processing through webpack's require.context, we let webpack handle everything
  const context = (require as any).context(
    '../../packages/server/postgres/migrations',
    false,
    /.ts$/
  )
  const collector = {}
  context.keys().forEach((relativePath) => {
    const {name, ext} = path.parse(relativePath)
    const key = `${cliPgmConfig['migrations-dir']}/${name}${ext}`
    collector[key] = context(relativePath)
  })
  const programmaticPgmConfig = {
    dbClient: cliPgmConfig,
    dir: path.join(__dirname, '..', cliPgmConfig['migrations-dir']),
    direction: 'up',
    migrationsTable: cliPgmConfig['migrations-table'],
    migrations: collector
  }
  await pgMigrate(programmaticPgmConfig as any)
  console.log('🐘 Postgres Migration Complete')
}

const migrateDBs = async () => {
  // RethinkDB must be run first because
  // Some PG migrations depemd on the latest state of RethinkDB
  await migrateRethinkDB()
  await migratePG()
  await r.getPoolMaster()?.drain()
}

// If called via CLI
if (require.main === module) migrateDBs()

export default migrateDBs
