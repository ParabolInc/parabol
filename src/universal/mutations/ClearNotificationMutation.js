import {commitMutation} from 'react-relay';
import getArrayWithoutIds from 'universal/utils/relay/getArrayWithoutIds';

const mutation = graphql`
  mutation ClearNotificationMutation($notificationId: ID!) {
    clearNotification(notificationId: $notificationId) {
      deletedId
    }
  }
`;

export const removeNotificationUpdater = (viewer, deletedId) => {
  const notifications = viewer.getLinkedRecords('notifications');
  if (notifications) {
    const newNodes = getArrayWithoutIds(notifications, deletedId);
    viewer.setLinkedRecords(newNodes, 'notifications');
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
      removeNotificationUpdater(viewer, deletedId);
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId);
      removeNotificationUpdater(viewer, notificationId);
    },
    onCompleted,
    onError
  });
};

export default ClearNotificationMutation;
