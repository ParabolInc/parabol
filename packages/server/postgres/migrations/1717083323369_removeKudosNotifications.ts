import {Kysely, PostgresDialect} from 'kysely'
import getPg from '../getPg'

export async function up() {
  const pg = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: getPg()
    })
  })

  await pg.deleteFrom('Notification').where('type', '=', 'KUDOS_RECEIVED').execute()
}

export async function down() {
  // noop
}
