import {r, RDatum} from 'rethinkdb-ts'

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
    .table('EmailVerification')
    .replace((row: RDatum) => row.without('segmentId').merge({pseudoId: row('segmentId')}))
    .run()
}

export async function down() {
  await connectRethinkDB()
  await r
    .table('EmailVerification')
    .replace((row: RDatum) => row.without('pseudoId').merge({segmentId: row('pseudoId')}))
    .run()
}
