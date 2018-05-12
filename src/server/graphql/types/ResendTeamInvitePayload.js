import {GraphQLObjectType} from 'graphql'
import {resolveInvitation} from 'server/graphql/resolvers'
import Invitation from 'server/graphql/types/Invitation'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const ResendTeamInvitePayload = new GraphQLObjectType({
  name: 'ResendTeamInvitePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    invitation: {
      type: Invitation,
      resolve: resolveInvitation
    }
  })
})

export default ResendTeamInvitePayload
