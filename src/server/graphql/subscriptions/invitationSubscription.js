import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import InvitationSubscriptionPayload from 'server/graphql/types/InvitationSubscriptionPayload'
import {isTeamMember} from 'server/utils/authorization'
import {INVITATION} from 'universal/utils/constants'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'

export default {
  type: new GraphQLNonNull(InvitationSubscriptionPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // RESOLUTION
    const channelName = `${INVITATION}.${teamId}`
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({invitationSubscription: data})
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve})
  }
}
