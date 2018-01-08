import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql';
import SegmentEventTrackOptions from 'server/graphql/types/SegmentEventTrackOptions';
import {getUserId, getUserOrgDoc, requireOrgLeader, requireTeamMember} from 'server/utils/authorization';
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
      requireTeamMember(authToken, teamId);
    }
    if (orgId) {
      const userOrgDoc = await getUserOrgDoc(userId, orgId);
      requireOrgLeader(userOrgDoc);
    }

    // RESOLUTION
    sendSegmentEvent(event, userId, options);
  }
};
