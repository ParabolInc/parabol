import {GQLContext} from './../graphql'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import UserTiersCount from '../types/UserTiersCount'
import {requireSU} from '../../utils/authorization'
import countTiersForUserId from './helpers/countTiersForUserId'

export default {
  type: UserTiersCount,
  args: {
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user for which you want the count of tier membership'
    }
  },
  async resolve(_source: unknown, {userId}: {userId: string}, {authToken}: GQLContext) {
    // AUTH
    requireSU(authToken)

    // RESOLUTION
    return {
      ...(await countTiersForUserId(userId)),
      userId
    }
  }
}
