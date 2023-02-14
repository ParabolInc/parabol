import {r} from 'rethinkdb-ts'
import {ParabolR} from './rethinkDriver'

const connectRethinkDB = async () => {
  const {hostname: host, port, pathname} = new URL(process.env.RETHINKDB_URL!)
  await r.connectPool({
    host,
    port: parseInt(port, 10),
    db: pathname.split('/')[1]
  })
  return r as any as ParabolR
}

export default connectRethinkDB
