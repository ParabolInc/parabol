import { Pool } from 'pg'

let pool
const getPostgres = () => {
  if (!pool) {
    pool = new Pool({ max: 1 })
  }
  return pool
}

export default getPostgres
