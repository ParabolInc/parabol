import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const RemoveSlackChannelPayload = new GraphQLObjectType({
  name: 'RemoveSlackChannelPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    deletedId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export default RemoveSlackChannelPayload
