import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql'
import SegmentEventTrackOptions from 'server/graphql/types/SegmentEventTrackOptions'
import {getUserId, isTeamMember, isUserBillingLeader} from 'server/utils/authorization'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import {sendOrgLeadAccessError, sendTeamAccessError} from 'server/utils/authorizationErrors'

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
  resolve: async (source, {event, options = {}}, {authToken}) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const {teamId, orgId} = options
    if (teamId) {
      // fail silently. they're being sneaky
      if (!isTeamMember(authToken, teamId)) {
        sendTeamAccessError(authToken, teamId, true)
      }
    }
    if (orgId) {
      if (!(await isUserBillingLeader(viewerId, orgId))) {
        return sendOrgLeadAccessError(authToken, orgId, true)
      }
    }

    // RESOLUTION
    sendSegmentEvent(event, viewerId, options)
    return true
  }
}
