import {GraphQLID, GraphQLNonNull, GraphQLList} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import DefaultRemovalPayload from 'server/graphql/types/DefaultRemovalPayload';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATIONS_CLEARED} from 'universal/utils/constants';

export default {
  type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DefaultRemovalPayload))),
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

    const notificationsCleared = [{
      deletedId: dbNotificationId
    }];
    getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared, mutatorId: socket.id});
    return notificationsCleared;
  }
};
