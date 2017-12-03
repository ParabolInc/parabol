import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import toGlobalId from 'universal/utils/relay/toGlobalId';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';

const mutation = graphql`
  mutation ClearNotificationMutation($notificationId: ID!) {
    clearNotification(notificationId: $notificationId) {
      deletedId
    }
  }
`;

export const clearNotificationUpdater = (viewer, deletedLocalIds) => {
  const conn = ConnectionHandler.getConnection(
    viewer,
    'DashboardWrapper_notifications'
  );
  if (conn) {
    const deletedGlobalIds = deletedLocalIds.map((id) => toGlobalId('Notification', id));
    deletedGlobalIds.forEach((globalId) => {
      ConnectionHandler.deleteNode(conn, globalId);
    });
  }
};

const ClearNotificationMutation = (environment, globalNotificationId, onError, onCompleted) => {
  const {id: notificationId} = fromGlobalId(globalNotificationId);
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
