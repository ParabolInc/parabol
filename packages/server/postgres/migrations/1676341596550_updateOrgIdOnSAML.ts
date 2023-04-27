import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  try {
    await r
      .table('SAML')
      .update((row: any) => ({
        orgId: row('orgId').default(null)
      }))
      .run()
    await r.table('SAML').indexCreate('orgId').run()
  } catch {}
  await r.getPoolMaster()?.drain()
}

export async function down() {
  await connectRethinkDB()
  await r.table('SAML').indexDrop('orgId').run()
  await r.getPoolMaster()?.drain()
}
