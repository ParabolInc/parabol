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
    .addColumn('freeCustomRetroTemplatesRemaining', 'int2', (col) => col.defaultTo(2).notNull())
    .addColumn('freeCustomPokerTemplatesRemaining', 'int2', (col) => col.defaultTo(2).notNull())
    .execute()
}

export async function down() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.schema
    .alterTable('User')
    .dropColumn('freeCustomRetroTemplatesRemaining')
    .dropColumn('freeCustomPokerTemplatesRemaining')
    .execute()
}
