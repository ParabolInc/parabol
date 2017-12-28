import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import TeamAddedPayload from 'server/graphql/types/TeamAddedPayload';
import {getUserId, requireAuth} from 'server/utils/authorization';
import {TEAM_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(TeamAddedPayload),
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
