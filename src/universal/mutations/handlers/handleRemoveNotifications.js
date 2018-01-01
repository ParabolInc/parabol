import {ConnectionHandler} from 'relay-runtime';
import getNotificationsConn from 'universal/mutations/connections/getNotificationsConn';
import ensureArray from 'universal/utils/ensureArray';

const handleRemoveNotifications = (maybeNotificationIds, store, viewerId) => {
  if (!maybeNotificationIds) return;
  const viewer = store.get(viewerId);
  const conn = getNotificationsConn(viewer);
  if (conn) {
    const notificationIds = ensureArray(maybeNotificationIds);
    notificationIds.forEach((deletedId) => {
      ConnectionHandler.deleteNode(conn, deletedId);
    });
  }
};

export default handleRemoveNotifications;
