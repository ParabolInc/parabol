import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import NotificationsAddedPayload from 'server/graphql/types/NotificationsAddedPayload';
import {getUserId, requireAuth} from 'server/utils/authorization';
import {NOTIFICATION} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(NotificationsAddedPayload),
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
