import {GraphQLError, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../utils/authorization'
import type {GQLContext} from './graphql'
import massInvitation from './queries/massInvitation'
import refreshPokerEstimateIntegration from './queries/refreshPokerEstimateIntegration'
import verifiedInvitation from './queries/verifiedInvitation'
import User from './types/User'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: new GraphQLNonNull(User),
      resolve: async (_source: unknown, _args: unknown, context: GQLContext) => {
        const {authToken, dataLoader} = context
        const viewerId = getUserId(authToken)
        if (!viewerId) throw new GraphQLError('Please log in')
        return dataLoader.get('users').load(viewerId)
      }
    },
    massInvitation,
    refreshPokerEstimateIntegration,
    verifiedInvitation
  })
})
