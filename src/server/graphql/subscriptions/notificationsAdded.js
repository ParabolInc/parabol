import {GraphQLNonNull} from 'graphql';
import makeSubscribeIter from 'server/graphql/makeSubscribeIter';
import NotificationsAddedPayload from 'server/graphql/types/NotificationsAddedPayload';
import {getUserId} from 'server/utils/authorization';
import {NOTIFICATIONS_ADDED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(NotificationsAddedPayload),
  subscribe: (source, args, {authToken, socketId}) => {
    const userId = getUserId(authToken);

    // RESOLUTION

    // note for this one we pass in an array of channel names. a userId & all the teamIds
    const channelNames = authToken.tms.concat(userId).map((id) => `${NOTIFICATIONS_ADDED}.${id}`);
    const filterFn = (value) => value.mutatorId !== socketId;
    return makeSubscribeIter(channelNames, {filterFn});
  }
};
