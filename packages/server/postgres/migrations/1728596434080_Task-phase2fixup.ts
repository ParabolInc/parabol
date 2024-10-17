import {Kysely, PostgresDialect, sql} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg
    .updateTable('Task')
    // coerce the serialized string to jsonb
    .set({content: sql`(content #>> '{}')::jsonb`})
    .execute()
}

export async function down() {
  // noop
}
