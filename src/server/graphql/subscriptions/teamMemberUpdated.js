import {GraphQLID, GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateTeamMemberPayload from 'server/graphql/types/UpdateTeamMemberPayload';
import {requireSUOrTeamMember} from 'server/utils/authorization';
import {TEAM_MEMBER_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateTeamMemberPayload),
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  subscribe: async (source, {teamId}, {authToken, socketId, operationId, sharedDataloader}) => {
    // AUTH
    requireSUOrTeamMember(authToken, teamId);

    // RESOLUTION
    const channelName = `${TEAM_MEMBER_UPDATED}.${teamId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, operationId, sharedDataloader});
  }
};
