import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  try {
    await r.table('SuggestedAction').indexCreate('teamId').run()
    await r.table('SuggestedAction').indexWait().run()
  } catch {
    // index already exists
  }
}

export async function down() {
  await connectRethinkDB()
  try {
    await r.table('SuggestedAction').indexDrop('teamId').run()
  } catch {
    // index already dropped
  }
}
