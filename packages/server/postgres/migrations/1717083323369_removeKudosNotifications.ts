import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  try {
    await connectRethinkDB()
    await r.table('Notification').filter(r.row('type').eq('KUDOS_RECEIVED')).delete().run()
    await r.getPoolMaster()?.drain()
  } catch (e) {
    console.log(e)
  }
}

export async function down() {
  // noop
}
