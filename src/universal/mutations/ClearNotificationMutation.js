import {commitMutation} from 'react-relay';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';
import toGlobalId from 'universal/utils/relay/toGlobalId';

const mutation = graphql`
  mutation ClearNotificationMutation($dbNotificationId: ID!) {
    clearNotification(dbNotificationId: $dbNotificationId) {
      deletedId
    }
  }
`;

export const clearNotificationUpdater = (viewer, deletedGlobalIds) => {
  const notifications = viewer.getLinkedRecords('notifications');
  if (notifications) {
    const newNodes = getArrayWithoutIds(notifications, deletedGlobalIds);
    viewer.setLinkedRecords(newNodes, 'notifications');
  }
};

const ClearNotificationMutation = (environment, dbNotificationId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {dbNotificationId},
    updater: (store) => {
      const viewer = store.get(viewerId);
      const deletedId = store.getRootField('clearNotification').getValue('deletedId');
      clearNotificationUpdater(viewer, deletedId);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      const notificationId = toGlobalId('Notification', dbNotificationId);
      clearNotificationUpdater(viewer, notificationId);
    },
    onCompleted,
    onError
  });
};

export default ClearNotificationMutation;
