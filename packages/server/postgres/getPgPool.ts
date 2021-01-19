import {Pool} from 'pg'

let pool
const getPgPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      max: process.env.NODE_ENV === 'production' ? 85 : 5 // leave 15 conns for su management in production
    })
  }
  return pool
}

export default getPgPool
