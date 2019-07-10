import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {GQLContext} from 'server/graphql/graphql'

const DenyPushInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'DenyPushInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    }
  })
})

export default DenyPushInvitationPayload
