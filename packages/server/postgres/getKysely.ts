import {Kysely, PostgresDialect} from 'kysely'
import traceKyselyQuery from '../tracing/traceKyselyQuery'
import getPg from './getPg'
import type {DB} from './types/pg'

let kysely: Kysely<DB> | undefined

const makeKysely = (schema?: string) =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: getPg(schema)
    }),
    log: traceKyselyQuery
  })

const getKysely = (schema?: string) => {
  if (!kysely) {
    kysely = makeKysely(schema)
  }
  return kysely
}

export default getKysely
