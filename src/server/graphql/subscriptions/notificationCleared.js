import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import DefaultRemovalPayload from 'server/graphql/types/DefaultRemovalPayload';
import {getUserId} from 'server/utils/authorization';

export default {
  type: new GraphQLNonNull(DefaultRemovalPayload),
  subscribe: (source, args, {authToken, socketId}) => {
    // AUTH
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `notificationCleared.${userId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn});
  }
};
