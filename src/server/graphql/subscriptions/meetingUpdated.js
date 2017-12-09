import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateMeetingPayload from 'server/graphql/types/UpdateMeetingPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {MEETING_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateMeetingPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (source, {teamId}, {authToken, socketId, dataLoader}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${MEETING_UPDATED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
