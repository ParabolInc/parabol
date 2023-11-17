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
    .table('ReflectPrompt')
    .get('sWOTAnalysisTemplate:stengthsPrompt')
    .update({question: 'Strengths'})
    .run()
}

export async function down() {
  // noop
}
