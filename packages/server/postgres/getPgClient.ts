import getPgPool from './getPgPool'
import {PoolClient} from 'pg'

const getPgClient = async (): Promise<PoolClient> => {
  const pgPool = getPgPool()
  const pgClient = await pgPool.connect()
  return pgClient
}

export default getPgClient
