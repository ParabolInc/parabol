import {Pool} from 'pg'
import getPgConfig from './getPgConfig'

const config = getPgConfig()

let pool: Pool | undefined
const getPg = () => {
  if (!pool) {
    pool = new Pool(config)
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
