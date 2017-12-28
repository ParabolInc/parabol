import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import UpdateTeamMemberPayload from 'server/graphql/types/UpdateTeamMemberPayload';
import {getUserId} from 'server/utils/authorization';
import {TEAM_MEMBER_UPDATED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(UpdateTeamMemberPayload),
  subscribe: async (source, args, {authToken, socketId, dataLoader}) => {
    const userId = getUserId(authToken);
    const {tms: teamIds} = authToken;
    const channelNames = teamIds.concat(userId).map((id) => `${TEAM_MEMBER_UPDATED}.${id}`);
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelNames, {filterFn, dataLoader});
  }
};
