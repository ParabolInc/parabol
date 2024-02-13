import {sql} from 'kysely'
import getKysely from '../../packages/server/postgres/getKysely'

export default async () => {
  console.log('🔩 Postgres Extension Checks Started')
  if (process.env.POSTGRES_USE_PGVECTOR === 'true') {
    console.log('   pgvector')
    const pg = getKysely()
    await sql`CREATE EXTENSION IF NOT EXISTS "vector";`.execute(pg)
  } else {
    console.log('   pgvector: skipping check (POSTGRES_USE_PGVECTOR !== true)')
  }
  console.log('🔩 Postgres Extension Checks Completed')
}
