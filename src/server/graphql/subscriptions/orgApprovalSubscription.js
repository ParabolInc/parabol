import {GraphQLID, GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import OrgApprovalSubscriptionPayload from 'server/graphql/types/OrgApprovalSubscriptionPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {ORG_APPROVAL} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(OrgApprovalSubscriptionPayload),
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
    const channelName = `${ORG_APPROVAL}.${teamId}`
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({orgApprovalSubscription: data})
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve})
  }
}
