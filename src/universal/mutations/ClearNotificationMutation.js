import {commitMutation} from 'react-relay';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment ClearNotificationMutation_notification on ClearNotificationPayload {
    notification {
      id
    }
  }
`;

const mutation = graphql`
  mutation ClearNotificationMutation($notificationId: ID!) {
    clearNotification(notificationId: $notificationId) {
      ...ClearNotificationMutation_notification @relay(mask: false)
    }
  }
`;

export const clearNotificationNotificationUpdater = (payload, store, viewerId) => {
  const notificationId = getInProxy(payload, 'notification', 'id');
  handleRemoveNotifications(notificationId, store, viewerId);
};

const ClearNotificationMutation = (environment, notificationId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {notificationId},
    updater: (store) => {
      const payload = store.getRootField('clearNotification');
      clearNotificationNotificationUpdater(payload, store, viewerId);
    },
    optimisticUpdater: (store) => {
      handleRemoveNotifications(notificationId, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default ClearNotificationMutation;
