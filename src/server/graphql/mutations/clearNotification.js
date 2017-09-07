import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import DefaultRemovalPayload from 'server/graphql/types/DefaultRemovalPayload';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';

export default {
  type: new GraphQLNonNull(DefaultRemovalPayload),
  description: 'Remove a notification by ID',
  args: {
    notificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the notification to remove'
    }
  },
  async resolve(source, {notificationId}, {authToken}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    await requireNotificationOwner(userId, notificationId);

    // RESOLUTION
    await r.table('Notification').get(notificationId).delete();

    const notificationCleared = {
      deletedId: notificationId
    };
    getPubSub().publish(`notificationCleared.${userId}`, {notificationCleared, mutatorId: socket.id});
    return notificationCleared;
  }
};
