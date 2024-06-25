import {Kysely, PostgresDialect} from 'kysely'
import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'
import getPg from '../getPg'

export async function up() {
  try {
    await connectRethinkDB()

    await r
      .table('RetroReflectionGroup')
      .replace((row) => row.without('summary'))
      .run()

    const pg = new Kysely<any>({
      dialect: new PostgresDialect({
        pool: getPg()
      })
    })

    await pg.schema.alterTable('RetroReflectionGroup').dropColumn('summary').execute()
  } catch (e) {
    console.error('Error during migration:', e)
  }
}

export async function down() {
  try {
    await connectRethinkDB()

    await r.table('RetroReflectionGroup').update({summary: null}).run()

    const pg = new Kysely<any>({
      dialect: new PostgresDialect({
        pool: getPg()
      })
    })

    await pg.schema
      .alterTable('RetroReflectionGroup')
      .addColumn('summary', 'varchar(2000)')
      .execute()
  } catch (e) {
    console.error('Error during rollback:', e)
  }
}
