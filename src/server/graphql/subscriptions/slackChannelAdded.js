import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import AddSlackChannelPayload from 'server/graphql/types/AddSlackChannelPayload'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(AddSlackChannelPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      const viewerId = getUserId(authToken)
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const channelName = `slackChannelAdded.${teamId}`
    const filterFn = (value) => value.mutatorId !== socketId
    return makeSubscribeIter(channelName, {filterFn, dataLoader})
  }
}
