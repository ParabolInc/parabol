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

export const up = async function () {
  await connectRethinkDB()
  await r.table('ScheduledJob').indexCreate('orgId').run()
  await r.getPoolMaster()?.drain()
}

export const down = async function () {
  await connectRethinkDB()
  await r.table('ScheduledJob').indexDrop('orgId').run()
  await r.getPoolMaster()?.drain()
}
