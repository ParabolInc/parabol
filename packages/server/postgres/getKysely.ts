import {Kysely, PostgresDialect} from 'kysely'
import getPg from './getPg'
import {DB} from './pg.d'

let kysely: Kysely<DB> | undefined
const getKysely = () => {
  if (!kysely) {
    const pg = getPg()
    kysely = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: pg
      })
      // query logging, if you'd like it:
      // log(event) {
      //   if (event.level === 'query') {
      //     console.log(event.query.sql)
      //     console.log(event.query.parameters)
      //   }
      // }
    })
  }
  return kysely
}

export default getKysely
