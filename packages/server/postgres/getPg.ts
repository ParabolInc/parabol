import {type Pool as PGPool, Pool} from 'pg'
import sleep from '../../client/utils/sleep'
import getPgConfig from './getPgConfig'

const config = getPgConfig()

const graceFullyReconnect = async () => {
  for (let i = 0; i < 1e6; i++) {
    const nextPool = new Pool(getPgConfig())
    try {
      const testClient = await nextPool.connect()
      testClient.release()
      nextPool.on('error', graceFullyReconnect)
      const oldPool = pool
      pool = nextPool
      oldPool?.emit('changePool')
      return
    } catch {
      await sleep(1000)
    }
  }
}

let pool: PGPool | undefined
const getPg = (schema?: string) => {
  if (!pool) {
    pool = new Pool(config) as PGPool
    pool.on('error', graceFullyReconnect)
    if (schema) {
      pool.on('connect', (client) => {
        // passing the search_path as a connection option does not work
        // That strategy requires explicitly stating the schema in each query
        client.query(`SET search_path TO "${schema}"`)
      })
    }
  }
  return pool
}

export const closePg = async () => {
  if (pool) {
    await pool.end()
    pool = undefined
  }
}

export default getPg
