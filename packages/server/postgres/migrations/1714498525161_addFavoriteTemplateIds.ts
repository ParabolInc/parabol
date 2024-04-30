import {Kysely, PostgresDialect} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.schema
    .alterTable('User')
    .addColumn('favoriteTemplateIds', 'jsonb', (col) => col.notNull())
    .execute()
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.schema.alterTable('User').dropColumn('favoriteTemplateIds').execute()
}
