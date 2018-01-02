import {commitMutation} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';

const mutation = graphql`
  mutation ClearNotificationMutation($notificationId: ID!) {
    clearNotification(notificationId: $notificationId) {
      notification {
        id
      }
    }
  }
`;

const ClearNotificationMutation = (environment, notificationId, onError, onCompleted) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {notificationId},
    updater: (store) => {
      handleRemoveNotifications(notificationId, store, viewerId);
    },
    optimisticUpdater: (store) => {
      handleRemoveNotifications(notificationId, store, viewerId);
    },
    onCompleted,
    onError
  });
};

export default ClearNotificationMutation;
