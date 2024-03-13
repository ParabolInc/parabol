import {Kysely, PostgresDialect} from 'kysely'
import getPg from '../getPgConfig'
import getKysely from '../getKysely'

export async function up() {
  const pg = getKysely()

  await pg.schema
    .alterTable('User')
    .addColumn('freeCustomRetroTemplatesRemaining', 'int2', (col) => col.defaultTo(2).notNull())
    .addColumn('freeCustomPokerTemplatesRemaining', 'int2', (col) => col.defaultTo(2).notNull())
    .execute()

  await pg.destroy()
}

export async function down() {
  const pg = getKysely()

  await pg.schema
    .alterTable('User')
    .dropColumn('freeCustomRetroTemplatesRemaining')
    .dropColumn('freeCustomPokerTemplatesRemaining')
    .execute()

  await pg.destroy()
}
