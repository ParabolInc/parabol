import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql';
import SegmentEventTrackOptions from 'server/graphql/types/SegmentEventTrackOptions';
import {
  getUserId, getUserOrgDoc, isTeamMember, requireOrgLeader,
  sendTeamAccessError
} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';


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
    const userId = getUserId(authToken);
    const {teamId, orgId} = options;
    if (teamId) {
      // fail silently. they're being sneaky
      if (!isTeamMember(authToken, teamId)) sendTeamAccessError(authToken, teamId, true);
    }
    if (orgId) {
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);
    }

    // RESOLUTION
    sendSegmentEvent(event, userId, options);
    return true;
  }
};
