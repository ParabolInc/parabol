import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  await r.tableDrop('ScheduledJob').run()
  await r.tableDrop('SAML').run()
  await r.tableDrop('SlackIntegration').run()
  await r.tableDrop('Provider').run()
  await r.tableDrop('AtlassianAuth').run()
  await r.tableDrop('FailedAuthRequest').run()
  await r.tableDrop('Organization').run()
}

export async function down() {
  // No migration down
}
