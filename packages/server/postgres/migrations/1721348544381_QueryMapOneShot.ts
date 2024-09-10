import {Kysely, PostgresDialect, sql} from 'kysely'
import {Client} from 'pg'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'
import getPgConfig from '../getPgConfig'

export async function up() {
  await connectRethinkDB()
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await sql`
    CREATE TABLE IF NOT EXISTS "QueryMap" (
      "id" VARCHAR(24) PRIMARY KEY,
      "query" TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
`.execute(pg)
  const queries = await r
    .table('QueryMap')
    .filter((row) => row('createdAt').default(null).ne(null))
    .run()
  if (queries.length === 0) return
  await pg.insertInto('QueryMap').values(queries).execute()
}

export async function down() {
  const client = new Client(getPgConfig())
  await client.connect()
  await client.query(`
    DROP TABLE "QueryMap";
    ` /* Do undo magic */)
  await client.end()
}
