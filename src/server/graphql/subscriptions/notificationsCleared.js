import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import NotificationsClearedPayload from 'server/graphql/types/NotificationsClearedPayload';
import {getUserId} from 'server/utils/authorization';
import {NOTIFICATIONS_CLEARED} from 'universal/utils/constants';

export default {
  type: NotificationsClearedPayload,
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${NOTIFICATIONS_CLEARED}.${userId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelName, {filterFn, dataLoader});
  }
};
