import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()

  try {
    await r.tableDrop('User').run()
  } catch (e) {
    // table already dropped
  }
}

export async function down() {
  // noop, if we recreated the table it wouldn't have the same indexes, etc.
}
