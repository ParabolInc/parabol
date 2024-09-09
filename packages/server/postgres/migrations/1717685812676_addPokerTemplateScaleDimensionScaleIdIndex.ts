import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  try {
    await r.table('TemplateDimension').indexCreate('scaleId').run()
    await r.table('TemplateDimension').indexWait().run()
  } catch {
    // index already exists
  }
}

export async function down() {
  await connectRethinkDB()
  try {
    await r.table('TemplateDimension').indexDrop('scaleId').run()
  } catch {
    // index already dropped
  }
}
