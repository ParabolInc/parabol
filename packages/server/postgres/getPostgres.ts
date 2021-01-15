import { Pool } from 'pg'

export enum dbKeys {
  web = 'web',
  metrics = 'metrics'
}

const pgUrlMap = {
  [dbKeys.web]: process.env.PG_WEB_URL,
  [dbKeys.metrics]: process.env.PG_METRICS_URL
} as {[key in dbKeys]: string}

const poolMap = {
  [dbKeys.web]: null,
  [dbKeys.metrics]: null
} as {[key in dbKeys]: typeof Pool | null}

const getPostgres = (dbKey: dbKeys = dbKeys.web) => {
  if (!poolMap[dbKey]) {
    poolMap[dbKey] = new Pool({
      connectionString: pgUrlMap[dbKey],
      max: process.env.NODE_ENV === 'production' ? 85 : 5 // leave 15 conns for su management in production
    })
  }
  return poolMap[dbKey]
}

export default getPostgres
