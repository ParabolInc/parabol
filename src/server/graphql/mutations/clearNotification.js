import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import ClearNotificationPayload from 'server/graphql/types/ClearNotificationPayload';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATION, REMOVED} from 'universal/utils/constants';

export default {
  type: ClearNotificationPayload,
  description: 'Remove a notification by ID',
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the notification to remove'
    }
  },
  async resolve(source, {notificationId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};

    // AUTH
    const userId = getUserId(authToken);
    const notification = await r.table('Notification').get(notificationId);
    requireNotificationOwner(userId, notification);

    // RESOLUTION
    await r.table('Notification')
      .get(notificationId)
      .delete();

    getPubSub().publish(`${NOTIFICATION}.${userId}`, {data: {notification, type: REMOVED}, ...subOptions});
    return {notification};
  }
};
