import {GraphQLObjectType} from 'graphql'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import {GQLContext} from 'server/graphql/graphql'
import User from 'server/graphql/types/User'

const PushInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'PushInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User
    }
  })
})

export default PushInvitationPayload
