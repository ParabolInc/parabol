import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../utils/authorization'
import {GQLContext} from './graphql'
import massInvitation from './queries/massInvitation'
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
        if (!viewerId) throw new Error('401 Please log in')
        return dataLoader.get('users').load(viewerId)
      }
    },
    massInvitation,
    verifiedInvitation
  })
})
