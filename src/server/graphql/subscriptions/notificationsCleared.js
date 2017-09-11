import {GraphQLNonNull, GraphQLList} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import DefaultRemovalPayload from 'server/graphql/types/DefaultRemovalPayload';
import {getUserId} from 'server/utils/authorization';
import {NOTIFICATIONS_CLEARED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DefaultRemovalPayload))),
  subscribe: (source, args, {authToken, socketId}) => {
    // AUTH
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${NOTIFICATIONS_CLEARED}.${userId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn});
  }
};
