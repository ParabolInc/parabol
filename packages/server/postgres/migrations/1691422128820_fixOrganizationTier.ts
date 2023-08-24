import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  try {
    await r
      .table('Organization')
      .filter(r.row('tier').eq('personal'))
      .update({tier: 'starter'})
      .run()
  } catch {}
  await r.getPoolMaster()?.drain()
}

export async function down() {
  // noop
}
