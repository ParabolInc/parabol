import getRethink from 'server/database/rethinkDriver';
import {
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';

export default {
  clearNotification: {
    type: GraphQLBoolean,
    description: 'Remove a notification by ID',
    args: {
      notificationId: {
        type: new GraphQLNonNull(GraphQLID),
        description: 'The id of the notification to remove'
      },
    },
    async resolve(source, {notificationId}, {authToken}) {
      const r = getRethink();

      // AUTH
      const userId = getUserId(authToken);
      await requireNotificationOwner(userId, notificationId);

      // RESOLUTION
      await r.table('Notification').get(notificationId).delete();
      return true;
    }
  }
};
