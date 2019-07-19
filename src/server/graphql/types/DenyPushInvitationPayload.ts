import {GraphQLID, GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {GQLContext} from 'server/graphql/graphql'

const DenyPushInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DenyPushInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    teamId: {
      type: GraphQLID
    },
    userId: {
      type: GraphQLID
    }
  })
})

export default DenyPushInvitationPayload
