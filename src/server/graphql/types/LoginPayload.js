import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveUser} from 'server/graphql/resolvers'
import User from 'server/graphql/types/User'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const LoginPayload = new GraphQLObjectType({
  name: 'LoginPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description: 'The user that just logged in',
      resolve: resolveUser
    },
    authToken: {
      type: GraphQLID,
      description: 'The new JWT'
    }
  })
})

export default LoginPayload
