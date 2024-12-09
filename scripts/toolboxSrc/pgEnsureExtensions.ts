import {sql} from 'kysely'
import getKysely from '../../packages/server/postgres/getKysely'
import {Logger} from '../../packages/server/utils/Logger'

export default async () => {
  Logger.log('🔩 Postgres Extension Checks Started')
  if (process.env.POSTGRES_USE_PGVECTOR === 'true') {
    Logger.log('   pgvector')
    const pg = getKysely()
    await sql`CREATE EXTENSION IF NOT EXISTS "vector";`.execute(pg)
  } else {
    Logger.log('   pgvector: skipping check (POSTGRES_USE_PGVECTOR !== true)')
  }
  Logger.log('🔩 Postgres Extension Checks Completed')
}
