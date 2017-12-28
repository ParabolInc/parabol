import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddTeamMemberPayload from 'server/graphql/types/AddTeamMemberPayload';
import {getUserId} from 'server/utils/authorization';
import {TEAM_MEMBER_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(AddTeamMemberPayload),
  subscribe: async (source, args, {authToken, socketId, dataLoader}) => {
    const userId = getUserId(authToken);
    const {tms: teamIds} = authToken;
    const channelNames = teamIds.concat(userId).map((id) => `${TEAM_MEMBER_ADDED}.${id}`);
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelNames, {filterFn, dataLoader});
  }
};
