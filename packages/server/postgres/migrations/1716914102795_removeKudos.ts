import {Kysely, PostgresDialect} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.schema.dropTable('Kudos').ifExists().execute()
  try {
    await pg.schema
      .alterTable('Team')
      .dropColumn('giveKudosWithEmoji')
      .dropColumn('kudosEmoji')
      .execute()
  } catch {
    // noop
  }
}

export async function down() {
  // noop
}
