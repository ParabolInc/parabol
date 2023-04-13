import {Kysely, PostgresDialect} from 'kysely'
import getPg from './getPg'
import {DB} from './pg.d'

const getKysely = () => {
  const pg = getPg()
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: pg
    })
  })
}

export default getKysely
