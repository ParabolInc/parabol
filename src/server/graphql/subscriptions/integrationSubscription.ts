import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import IntegrationSubscriptionPayload from 'server/graphql/types/IntegrationSubscriptionPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {INTEGRATION} from 'universal/utils/constants'
import standardError from '../../utils/standardError'

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
      const viewerId = getUserId(authToken)
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    const channelName = `${INTEGRATION}.${teamId}`
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({integrationSubscription: data})
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve})
  }
}
