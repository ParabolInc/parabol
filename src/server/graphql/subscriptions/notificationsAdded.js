import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import NotificationsAddedPayload from 'server/graphql/types/NotificationsAddedPayload';
import {getUserId} from 'server/utils/authorization';
import {NOTIFICATIONS_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(NotificationsAddedPayload),
  subscribe: (source, args, {authToken}) => {
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${NOTIFICATIONS_ADDED}.${userId}`;
    console.log('subbing to', channelName);
    return makeSubscribeIter(channelName);
  }
};
