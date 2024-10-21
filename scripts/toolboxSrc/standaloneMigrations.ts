// Should roughly match runMigrations.js except it isn't run in PM2 in dev
// This file is bundled by webpack into a small migrate.js file which includes all migration files & their deps
// It is used by PPMIs who are only provided with the bundles
import path from 'path'
import cliPgmConfig from '../../packages/server/postgres/pgmConfig'
import '../webpack/utils/dotenv'
import pgEnsureExtensions from './pgEnsureExtensions'
import pgMigrate from './pgMigrateRunner'

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
  await migratePG()
}

// If called via CLI
if (require.main === module) migrateDBs()

export default migrateDBs
