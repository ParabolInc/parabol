import {Pool} from 'pg'
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
    } catch (e) {
      await sleep(1000)
    }
  }
}

let pool: Pool | undefined
const getPg = (schema?: string) => {
  if (!pool) {
    pool = new Pool(config)
    pool.on('error', graceFullyReconnect)
    if (schema) {
      pool.on('connect', (client) => {
        // passing the search_path as a connection option does not work
        // The schema has to be explicitly each time that way.
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
