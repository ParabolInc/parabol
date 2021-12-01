import {GQLContext} from './../graphql'
import {GraphQLInt} from 'graphql'
import getPg from '../../postgres/getPg'
import {requireSU} from '../../utils/authorization'
import TierEnum from '../types/TierEnum'
import {TierEnum as ETierEnum} from '../../postgres/queries/generated/updateUserQuery'

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
  async resolve(_source: unknown, {tier}: {tier: ETierEnum}, {authToken}: GQLContext) {
    // AUTH
    requireSU(authToken)

    // RESOLUTION
    const pg = getPg()
    const result = await pg.query(
      'SELECT count(*)::float FROM "User" WHERE inactive = FALSE AND tier = $1',
      [tier]
    )
    return result.rows[0].count
  }
}
