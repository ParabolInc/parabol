import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import User from './User'
import {resolveUser} from '../resolvers'

const InactivateUserPayload = new GraphQLObjectType({
  name: 'InactivateUserPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description: 'The user that has been inactivated',
      resolve: resolveUser
    }
  })
})

export default InactivateUserPayload
