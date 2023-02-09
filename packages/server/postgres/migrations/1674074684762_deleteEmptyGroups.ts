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
  await r.table('RetroReflectionGroup').filter({isActive: false}).delete().run()
  await r.getPoolMaster()?.drain()
}

export async function down() {
  // can't undo a delete
}
