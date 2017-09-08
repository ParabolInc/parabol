import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import DefaultRemovalPayload from 'server/graphql/types/DefaultRemovalPayload';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATION_CLEARED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(DefaultRemovalPayload),
  description: 'Remove a notification by ID',
  args: {
    dbNotificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the notification to remove'
    }
  },
  async resolve(source, {dbNotificationId}, {authToken}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    const notification = await r.table('Notification').get(dbNotificationId);
    await requireNotificationOwner(userId, notification);

    // RESOLUTION
    await r.table('Notification').get(dbNotificationId).delete();

    const notificationCleared = {
      deletedId: dbNotificationId
    };
    getPubSub().publish(`${NOTIFICATION_CLEARED}.${userId}`, {notificationCleared, mutatorId: socket.id});
    return notificationCleared;
  }
};
