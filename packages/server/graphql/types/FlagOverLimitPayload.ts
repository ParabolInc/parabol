import {GraphQLObjectType} from 'graphql'
import User from './User'
import StandardMutationError from './StandardMutationError'
import {resolveUser} from '../resolvers'

const FlagOverLimitPayload = new GraphQLObjectType({
  name: 'FlagOverLimitPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description: 'the user with the limit added or removed',
      resolve: resolveUser
    }
  })
})

export default FlagOverLimitPayload
