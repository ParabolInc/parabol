import {type Pool as PGPool, Pool} from 'pg'
import {Logger} from '../utils/Logger'
import getPgConfig from './getPgConfig'

const config = getPgConfig()

let pool: PGPool | undefined
const getPg = (schema?: string) => {
  if (!pool) {
    pool = new Pool(config) as PGPool
    // The pool has already dropped the failed idle client. Without a listener, Node throws the error and the process exits
    pool.on('error', (error) => {
      Logger.warn('Postgres closed an idle pooled connection', error)
    })
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
