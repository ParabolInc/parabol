import pgpInit, {IDatabase, IMain} from 'pg-promise'
import getPgConfig from './getPgConfig'

let pgp: IMain | null = null
let pg: IDatabase<unknown> | null = null

const getPgp = () => {
  if (!pgp || !pg) {
    pgp = pgpInit()
    pg = pgp(getPgConfig())
  }
  return {pg, pgp}
}

export default getPgp
