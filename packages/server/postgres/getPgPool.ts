import {Pool} from 'pg'

let pool
const getPgPool = () => {
  if (!pool) {
    pool = new Pool({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      max: process.env.NODE_ENV === 'production' ? 85 : 5 // leave 15 conns for su management in production
    })
  }
  return pool
}

export default getPgPool
