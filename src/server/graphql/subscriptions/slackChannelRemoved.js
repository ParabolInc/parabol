import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import {isTeamMember} from 'server/utils/authorization'
import RemoveSlackChannelPayload from 'server/graphql/types/RemoveSlackChannelPayload'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'

export default {
  type: new GraphQLNonNull(RemoveSlackChannelPayload),
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
    const channelName = `slackChannelRemoved.${teamId}`
    const filterFn = (value) => value.mutatorId !== socketId
    return makeSubscribeIter(channelName, {filterFn, dataLoader})
  }
}
