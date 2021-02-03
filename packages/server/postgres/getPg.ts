import {Pool} from 'pg'
import PROD from '../PROD'

let pool: Pool
const getPg = () => {
  if (!pool) {
    pool = new Pool({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      max: PROD ? 85 : 5 // leave 15 conns for su management in production
    })
  }
  return pool
}

export default getPg
