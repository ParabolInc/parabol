import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import Notification from 'server/graphql/types/Notification';
import {getUserId} from 'server/utils/authorization';
import {NOTIFICATION_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(Notification),
  subscribe: (source, args, {authToken}) => {
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `${NOTIFICATION_ADDED}.${userId}`;
    return makeSubscribeIter(channelName);
  }
};
