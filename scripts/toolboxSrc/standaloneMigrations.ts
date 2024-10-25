// Should roughly match runMigrations.js except it isn't run in PM2 in dev
// This file is bundled by webpack into a small migrate.js file which includes all migration files & their deps
// It is used by PPMIs who are only provided with the bundles
import {Migrator} from 'kysely'
import path from 'path'
import {migrations} from '../../.config/kyselyMigrations'
import getKysely from '../../packages/server/postgres/getKysely'
import '../../packages/server/types/webpackEnv.d'
import '../webpack/utils/dotenv'
import pgEnsureExtensions from './pgEnsureExtensions'

const migratePG = async () => {
  console.log('🐘 Postgres Migration Started')
  await pgEnsureExtensions()
  // pgm uses a dynamic require statement, which doesn't work with webpack
  // if we ignore that dynamic require, we'd still have to include the migrations directory AND any dependencies it might have
  // by processing through webpack's require.context, we let webpack handle everything
  const context = require.context('../../packages/server/postgres/migrations', false, /.ts$/)
  const collector: Record<string, any> = {}
  const migrationPaths = context.keys()
  migrationPaths.forEach((relativePath) => {
    const {name} = path.parse(relativePath)
    collector[name] = context(relativePath)
  })
  const pg = getKysely()
  const migrator = new Migrator({
    ...migrations,
    db: pg,
    provider: {
      async getMigrations() {
        return collector
      }
    }
  })
  const {error, results} = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`  ✅ Migration: ${it.migrationName}`)
    } else if (it.status === 'Error') {
      console.error(`  ⛔️ Migration: ${it.migrationName}`)
    }
  })

  if (error) {
    console.log('🐘 Postgres Migration Failed')
    console.error(error)
  } else {
    console.log('🐘 Postgres Migration Complete')
  }
}

// If called via CLI
if (require.main === module) migratePG()

export default migratePG
