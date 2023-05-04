import {r} from 'rethinkdb-ts'
import {ParabolR} from '../../database/rethinkDriver'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
  return r as any as ParabolR
}

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
