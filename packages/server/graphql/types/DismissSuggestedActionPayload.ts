import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveUser} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import User from './User'

const DismissSuggestedActionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DismissSuggestedActionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      description: 'The user that dismissed the action',
      resolve: resolveUser
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'The id of the removed suggested action'
    }
  })
})

export default DismissSuggestedActionPayload
