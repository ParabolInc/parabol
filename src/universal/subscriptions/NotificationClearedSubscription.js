import {removeNotificationUpdater} from 'universal/mutations/ClearNotificationMutation';

const subscription = graphql`
  subscription NotificationClearedSubscription {
    notificationCleared {
      deletedId
    }
  }
`;

const NotificationClearedSubscription = (environment) => {
  const {ensureSubscription, viewerId} = environment;
  return ensureSubscription({
    subscription,
    updater: (store) => {
      const viewer = store.get(viewerId);
      const deletedId = store.getRootField('notificationCleared').getValue('deletedId');
      removeNotificationUpdater(viewer, deletedId);
    }
  });
};

export default NotificationClearedSubscription;
