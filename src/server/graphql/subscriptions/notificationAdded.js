import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import Notification from 'server/graphql/types/Notification';
import {getUserId} from 'server/utils/authorization';

export default {
  type: new GraphQLNonNull(Notification),
  subscribe: (source, args, {authToken}) => {
    const userId = getUserId(authToken);

    // RESOLUTION
    const channelName = `notificationAdded.${userId}`;
    return makeSubscribeIter(channelName);
  }
};
