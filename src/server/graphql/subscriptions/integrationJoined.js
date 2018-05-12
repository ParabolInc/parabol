import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import {isTeamMember} from 'server/utils/authorization'
import JoinIntegrationPayload from 'server/graphql/types/JoinIntegrationPayload'
import IntegrationService from 'server/graphql/types/IntegrationService'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'

export default {
  type: new GraphQLNonNull(JoinIntegrationPayload),
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
      return sendTeamAccessError(authToken, teamId)
    }

    // RESOLUTION
    const channelName = `integrationJoined.${teamId}.${service}`
    const filterFn = (value) => value.mutatorId !== socketId
    return makeSubscribeIter(channelName, {filterFn, dataLoader})
  }
}
