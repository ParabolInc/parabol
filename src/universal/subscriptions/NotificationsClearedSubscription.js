import {clearNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';

const subscription = graphql`
  subscription NotificationsClearedSubscription {
    notificationsCleared {
      deletedIds
    }
  }
`;

const NotificationsClearedSubscription = (environment) => {
  const {viewerId} = environment;
  return {
    subscription,
    updater: (store) => {
      const viewer = store.get(viewerId);
      const deletedIds = store.getRootField('notificationsCleared').getValue('deletedIds');
      clearNotificationUpdater(viewer, deletedIds);
    }
  };
};

export default NotificationsClearedSubscription;
