import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';

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
      const deletedId = store.getRootField('clearNotification').getValue('deletedId');
      handleRemoveNotifications(deletedId, store, viewerId);
    },
    optimisticUpdater: (store) => {
      handleRemoveNotifications(notificationId, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default ClearNotificationMutation;
