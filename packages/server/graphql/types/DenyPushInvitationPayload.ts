import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'

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
