import {GraphQLID, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {getUserId} from 'server/utils/authorization'
import User from './User'

const RemoveAtlassianAuthPayload = new GraphQLObjectType({
  name: 'RemoveAtlassianAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authId: {
      type: GraphQLID,
      description: 'The ID of the authorization removed'
    },
    teamId: {
      type: GraphQLID
    },
    user: {
      type: User,
      description: 'The user with updated atlassianAuth',
      resolve: (_source, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        return dataLoader.get('users').load(viewerId)
      }
    }
  })
})

export default RemoveAtlassianAuthPayload
