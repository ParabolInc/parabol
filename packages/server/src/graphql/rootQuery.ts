import {GraphQLObjectType} from 'graphql'
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
      type: User,
      resolve: async (_source, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        return viewerId ? dataLoader.get('users').load(viewerId) : null
      }
    },
    getDemoEntities,
    massInvitation,
    verifiedInvitation,
    SAMLIdP
  })
})
