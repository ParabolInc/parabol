import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import LeaveIntegrationPayload from 'server/graphql/types/LeaveIntegrationPayload'
import IntegrationService from 'server/graphql/types/IntegrationService'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(LeaveIntegrationPayload),
  args: {
    service: {
      type: new GraphQLNonNull(IntegrationService)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (source, {service, teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      const viewerId = getUserId(authToken)
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const channelName = `integrationLeft.${teamId}.${service}`
    const filterFn = (value) => value.mutatorId !== socketId
    return makeSubscribeIter(channelName, {filterFn, dataLoader})
  }
}
