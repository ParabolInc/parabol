import {Kysely, PostgresDialect, sql} from 'kysely'
import {Client} from 'pg'
import getPg from '../getPg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  pg.schema
  // I had to normalize domains to its own table to guarantee uniqueness (and make indexing easier)
  await sql`
  CREATE EXTENSION IF NOT EXISTS "vector";
  CREATE TABLE IF NOT EXISTS "ReflectionEmbeddings" (
    "id" VARCHAR(100) PRIMARY KEY,
    "vector" VECTOR NOT NULL,
    "meetingId" VARCHAR(100) NOT NULL,
    "teamId" VARCHAR(100) NOT NULL,
    "orgId" VARCHAR(100) NOT NULL
  );`.execute(pg)
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`DROP TABLE IF EXISTS "ReflectionEmbeddings";`)
  await client.end()
}
