import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  const almostAMonthAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
  await r
    .table('Notification')
    .filter({type: 'TEAM_INVITATION'})
    .filter((row) => row('createdAt').le(almostAMonthAgo))
    .delete()
    .run()
}

export async function down() {
  // noop
}
