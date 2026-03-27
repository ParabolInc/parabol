import {sql} from 'kysely'
import getKysely from '../../packages/server/postgres/getKysely'
import {Logger} from '../../packages/server/utils/Logger'

export const pgEnsureExtensions = async () => {
  Logger.log('🔩 Postgres Extension Checks Started')
  if (process.env.POSTGRES_USE_PGVECTOR === 'true') {
    Logger.log('   pgvector')
    const pg = getKysely()
    // Ensure the desired version is available in ironbank, AWS, and GCP
    await sql`
    CREATE EXTENSION IF NOT EXISTS "vector";
    ALTER EXTENSION vector UPDATE;
    `.execute(pg)
  } else {
    Logger.log('   pgvector: skipping check (POSTGRES_USE_PGVECTOR !== true)')
  }
  Logger.log('🔩 Postgres Extension Checks Completed')
}

if (require.main === module) {
  pgEnsureExtensions()
}
