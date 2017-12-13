import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddTeamMemberPayload from 'server/graphql/types/AddTeamMemberPayload';
import {requireTeamMember} from 'server/utils/authorization';
import {TEAM_MEMBER_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(AddTeamMemberPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (source, {teamId}, {authToken, socketId, dataLoader}) => {
    // AUTH
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${TEAM_MEMBER_ADDED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
