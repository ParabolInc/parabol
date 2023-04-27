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
    })
  }
  return kysely
}

export default getKysely
