import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import NotificationAddedPayload from 'server/graphql/types/NotificationAddedPayload';
import {getUserId} from 'server/utils/authorization';
import {NOTIFICATION_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(NotificationAddedPayload),
  subscribe: (source, args, {authToken}) => {
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${NOTIFICATION_ADDED}.${userId}`;
    console.log('subbing to', channelName)
    return makeSubscribeIter(channelName);
  }
};
