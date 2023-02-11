import {r} from 'rethinkdb-ts'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
}

export async function up() {
  await connectRethinkDB()
  await r
    .table('SAML')
    .update((row) => ({
      orgId: row('orgId').default(null)
    }))
    .run()

  await r.table('SAML').indexCreate('orgId').run()
}

export async function down() {
  await r.table('SAML').indexDrop('orgId').run()
}
