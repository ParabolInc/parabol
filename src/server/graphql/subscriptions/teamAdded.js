import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import AddTeamPayload from 'server/graphql/types/AddTeamPayload';
import {getUserId, requireAuth} from 'server/utils/authorization';
import {TEAM_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(AddTeamPayload),
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireAuth(authToken);
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${TEAM_ADDED}.${userId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
