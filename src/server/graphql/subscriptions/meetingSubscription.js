import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import MeetingSubscriptionPayload from 'server/graphql/types/MeetingSubscriptionPayload';
import {requireTeamMember} from 'server/utils/authorization';
import {MEETING} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(MeetingSubscriptionPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (source, {teamId}, {authToken, socketId, dataLoader}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${MEETING}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({meetingUpdated: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};
