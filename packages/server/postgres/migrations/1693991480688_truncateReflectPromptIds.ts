import {r, RDatum} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

/**
 * The prompt id is used as a foreign key in the ReflectionGroup table and thus should not be excessively long => truncate it to 100 characters.
 */
export async function up() {
  await connectRethinkDB()
  await r
    .table('ReflectPrompt')
    .insert(
      r
        .table('ReflectPrompt')
        .filter((row: RDatum) => row('id').count().gt(100))
        .map((row: RDatum) => row.merge({id: row('id').slice(0, 100)}))
    )
    .run()
  await r
    .table('ReflectPrompt')
    .filter((row: RDatum) => row('id').count().gt(100))
    .delete()
    .run()
  await r.getPoolMaster()?.drain()
}

export async function down() {
  // no down migration, as long as ids are unique, we're fine
}
