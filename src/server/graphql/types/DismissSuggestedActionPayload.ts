import {GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveUser} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import User from 'server/graphql/types/User'

const DismissSuggestedActionPayload = new GraphQLObjectType({
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
