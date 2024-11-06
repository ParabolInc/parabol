import {Kysely, PostgresDialect} from 'kysely'
import getPg from './getPg'
import {DB} from './types/pg'

let kysely: Kysely<DB> | undefined

const makeKysely = (schema?: string) => {
  const nextPg = getPg(schema)
  nextPg.on('poolChange' as any, () => makeKysely(schema))
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: nextPg
    })
    // ,log(event) {
    //   if (event.level === 'query') {
    //     console.log(event.query.sql)
    //     console.log(event.query.parameters)
    //   }
    // }
  })
}

const getKysely = (schema?: string) => {
  if (!kysely) {
    kysely = makeKysely(schema)
  }
  return kysely
}

export default getKysely
