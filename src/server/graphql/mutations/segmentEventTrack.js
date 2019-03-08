import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql'
import SegmentEventTrackOptions from 'server/graphql/types/SegmentEventTrackOptions'
import {getUserId, isTeamMember, isUserBillingLeader} from 'server/utils/authorization'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import standardError from 'server/utils/standardError'

export default {
  name: 'SegmentEventTrack',
  description: 'track an event in segment, like when errors are hit',
  type: GraphQLBoolean,
  args: {
    event: {
      type: new GraphQLNonNull(GraphQLString)
    },
    options: {
      type: SegmentEventTrackOptions
    }
  },
  resolve: async (source, {event, options = {}}, {authToken, dataLoader}) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const {teamId, orgId} = options
    if (teamId) {
      // fail silently. they're being sneaky
      if (!isTeamMember(authToken, teamId)) {
        standardError(new Error('Failed input validation'), {userId: viewerId})
        return false
      }
    }
    if (orgId) {
      if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
        standardError(new Error('Failed input validation'), {userId: viewerId})
        return false
      }
    }

    // RESOLUTION
    sendSegmentEvent(event, viewerId, options)
    return true
  }
}
