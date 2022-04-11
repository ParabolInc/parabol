import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../utils/authorization'
import {GQLContext} from './graphql'
import getDemoEntities from './queries/getDemoEntitites'
import massInvitation from './queries/massInvitation'
import SAMLIdP from './queries/SAMLIdP'
import verifiedInvitation from './queries/verifiedInvitation'
import User from './types/User'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: new GraphQLNonNull(User),
      resolve: async (_source: unknown, _args: unknown, {authToken, dataLoader}: GQLContext) => {
        const viewerId = getUserId(authToken)
        if (!viewerId) throw new Error('401 Please log in')
        return dataLoader.get('users').load(viewerId)
      }
    },
    getDemoEntities,
    massInvitation,
    verifiedInvitation,
    SAMLIdP
  })
})
