import {GraphQLObjectType} from 'graphql'
import User from 'server/graphql/types/User'
import {getUserId} from 'server/utils/authorization'
import verifiedInvitation from 'server/graphql/queries/verifiedInvitation'

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: User,
      resolve: (source, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        return dataLoader.get('users').load(viewerId)
      }
    },
    verifiedInvitation
  })
})
