import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import sendSegmentEvent from 'server/utils/sendSegmentEvent';


export default {
  name: 'SegmentEventTrack',
  description: 'track an event in segment, like when errors are hit',
  type: GraphQLBoolean,
  args: {
    event: {
      type: new GraphQLNonNull(GraphQLString)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (source, {event, userId, teamId}, {authToken}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    sendSegmentEvent(event, userId, {teamId});

  }
};
