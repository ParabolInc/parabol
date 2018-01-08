import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import NotificationSubscriptionPayload from 'server/graphql/types/NotificationSubscriptionPayload';
import {getUserId, requireAuth} from 'server/utils/authorization';
import {NOTIFICATION} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(NotificationSubscriptionPayload),
  subscribe: (source, args, {authToken, dataLoader, socketId}) => {
    // AUTH
    requireAuth(authToken);

    // RESOLUTION
    const viewerId = getUserId(authToken);
    const channelName = `${NOTIFICATION}.${viewerId}`;
    const filterFn = (value) => value.mutatorId !== socketId;
    const resolve = ({data}) => ({notificationSubscription: data});
    return makeSubscribeIter(channelName, {filterFn, dataLoader, resolve});
  }
};
