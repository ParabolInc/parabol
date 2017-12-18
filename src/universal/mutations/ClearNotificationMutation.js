import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';

const mutation = graphql`
  mutation ClearNotificationMutation($notificationId: ID!) {
    clearNotification(notificationId: $notificationId) {
      deletedId
    }
  }
`;

export const clearNotificationUpdater = (viewer, deletedIds) => {
  const conn = ConnectionHandler.getConnection(
    viewer,
    'DashboardWrapper_notifications'
  );
  if (conn) {
    deletedIds.forEach((deletedId) => {
      ConnectionHandler.deleteNode(conn, deletedId);
    });
  }
};

const ClearNotificationMutation = (environment, notificationId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {notificationId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const deletedId = store.getRootField('clearNotification').getValue('deletedId');
      clearNotificationUpdater(viewer, [deletedId]);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      clearNotificationUpdater(viewer, [notificationId]);
    },
    onCompleted,
    onError
  });
};

export default ClearNotificationMutation;
