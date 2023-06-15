import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  await r.table('RetroReflectionGroup').filter({isActive: false}).delete().run()
  await r.getPoolMaster()?.drain()
}

export async function down() {
  // can't undo a delete
}
