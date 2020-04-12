import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import User from './User'
import {resolveUser} from '../resolvers'
import {GQLContext} from '../graphql'

const InactivateUserPayload = new GraphQLObjectType<any, GQLContext>({
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
