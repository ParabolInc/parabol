import {removeNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';

const subscription = graphql`
  subscription NotificationsClearedSubscription {
    notificationsCleared {
      deletedIds
    }
  }
`;

const NotificationsClearedSubscription = (environment) => {
  const {ensureSubscription, viewerId} = environment;
  return ensureSubscription({
    subscription,
    updater: (store) => {
      const viewer = store.get(viewerId);
      const deletedIds = store.getRootField('notificationsCleared').getValue('deletedIds');
      removeNotificationUpdater(viewer, deletedIds);
    }
  });
};

export default NotificationsClearedSubscription;
