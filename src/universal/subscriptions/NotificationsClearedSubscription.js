import {removeNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';

const subscription = graphql`
  subscription NotificationsClearedSubscription {
    notificationsCleared {
      deletedId
    }
  }
`;

const NotificationsClearedSubscription = (environment) => {
  const {ensureSubscription, viewerId} = environment;
  return ensureSubscription({
    subscription,
    updater: (store) => {
      const viewer = store.get(viewerId);
      const deletedIds = store.getRootField('notificationsCleared').getValue('deletedId');
      removeNotificationUpdater(viewer, deletedIds);
    }
  });
};

export default NotificationsClearedSubscription;
