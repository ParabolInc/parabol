import {sql} from 'kysely'
import getKysely from '../../packages/server/postgres/getKysely'

export default async () => {
  console.log('🔩 Postgres Extension Checks Started')
  const pg = getKysely()
  await sql`CREATE EXTENSION IF NOT EXISTS "vector";`.execute(pg)
  console.log('🔩 Postgres Extension Checks Completed')
}
