import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import IntegrationSubscriptionPayload from 'server/graphql/types/IntegrationSubscriptionPayload'
import {isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {INTEGRATION} from 'universal/utils/constants'

export default {
  type: new GraphQLNonNull(IntegrationSubscriptionPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: (_source, {teamId}, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // RESOLUTION
    const channelName = `${INTEGRATION}.${teamId}`
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({integrationSubscription: data})
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve})
  }
}
