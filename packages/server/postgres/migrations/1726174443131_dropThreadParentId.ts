import {Kysely, PostgresDialect} from 'kysely'
import {Client} from 'pg'
import getPg from '../getPg'
import getPgConfig from '../getPgConfig'

export async function up() {
  const client = new Client(getPgConfig())
  await client.connect()
  // threadParentId can exist outside comment table (task, poll, etc)
  await client.query(
    `ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS fk_threadParentId;` /* Do good magic */
  )
  await client.end()
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })
  await pg.schema
    .alterTable('Comment')
    .addForeignKeyConstraint('fk_threadParentId', ['threadParentId'], 'Comment', ['id'])
    .onDelete('set null')
    .execute()
}
