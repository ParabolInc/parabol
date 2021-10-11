import {GraphQLInt} from 'graphql'
import getPg from '../../postgres/getPg'
import {requireSU} from '../../utils/authorization'
import TierEnum from '../types/TierEnum'

export default {
  type: GraphQLInt,
  args: {
    tier: {
      type: TierEnum,
      defaultValue: 'pro',
      description: 'which tier of org shall we count?'
    }
  },
  // Only counts users who are active
  async resolve(_source, {tier}, {authToken}) {
    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const pg = getPg()
    const result = await pg.query(
      'SELECT count(*) FROM "User" WHERE inactive = FALSE AND tier = $1',
      [tier]
    )
    return result.rows[0].count
  }
}
