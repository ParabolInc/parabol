import getPg from '../../../postgres/getPg'
import {QueryResolvers} from '../resolverTypes'

const suUserCount: QueryResolvers['suUserCount'] = async (_source, {tier}) => {
  const pg = getPg()
  const result = await pg.query(
    'SELECT count(*)::float FROM "User" WHERE inactive = FALSE AND tier = $1',
    [tier]
  )
  return result.rows[0].count
}

export default suUserCount
