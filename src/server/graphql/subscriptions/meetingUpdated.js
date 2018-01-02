import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateMeetingPayload from 'server/graphql/types/UpdateMeetingPayload';
import {requireTeamMember} from 'server/utils/authorization';
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
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${MEETING_UPDATED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({meetingUpdated: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};
