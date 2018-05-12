import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import NotificationSubscriptionPayload from 'server/graphql/types/NotificationSubscriptionPayload';
import {getUserId, isAuthenticated} from 'server/utils/authorization';
import {NOTIFICATION} from 'universal/utils/constants';
import {sendNotAuthenticatedAccessError} from 'server/utils/authorizationErrors';

export default {
  type: new GraphQLNonNull(NotificationSubscriptionPayload),
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return sendNotAuthenticatedAccessError(authToken);
    }

    // RESOLUTION
    const viewerId = getUserId(authToken);
    const channelName = `${NOTIFICATION}.${viewerId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({notificationSubscription: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};
