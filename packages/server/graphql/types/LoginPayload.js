import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveUser} from '../resolvers'
import User from './User'
import StandardMutationError from './StandardMutationError'

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
