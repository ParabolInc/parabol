import type {Pool as PGPool} from 'pg'
import sleep from '../../client/utils/sleep'
import getPgConfig from './getPgConfig'
/*
Force a native `require` so dd-trace-js can monkeypatch the require statement.
In development, the require statement requires `./pg.ts` since require resolves packages by first looking in the same dir
In production, the require statement will resolve to the node_modules found in /dist
*/

// when used outside of webpack, e.g. kysely.config.js, go vanilla
declare let __non_webpack_require__: typeof require
const pg =
  typeof __non_webpack_require__ === 'undefined' ? require('pg') : __non_webpack_require__('pg')
const {Pool} = pg
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
