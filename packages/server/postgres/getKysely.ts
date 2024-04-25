import {Kysely, PostgresDialect} from 'kysely'
import getPg from './getPg'
import {DB} from './pg.d'

let kysely: Kysely<DB> | undefined

const makeKysely = () => {
  const nextPg = getPg()
  nextPg.on('poolChange' as any, makeKysely)
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

const getKysely = () => {
  if (!kysely) {
    kysely = makeKysely()
  }
  return kysely
}

export default getKysely
