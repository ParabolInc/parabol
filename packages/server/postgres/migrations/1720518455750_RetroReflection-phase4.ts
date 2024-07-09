import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  try {
    await r.tableDrop('RetroReflection').run()
  } catch (error) {
    // table already dropped
  }
}

export async function down() {
  // No migration down
}
