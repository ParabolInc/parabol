import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATIONS_ADDED, NOTIFICATIONS_CLEARED} from 'universal/utils/constants';

const publishNotifications = ({notificationsToAdd, notificationsToClear}) => {
  Object.keys(notificationsToAdd).forEach((userId) => {
    const notificationsAdded = {
      notifications: notificationsToAdd[userId]
    };
    getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded});
  });
  Object.keys(notificationsToClear).forEach((userId) => {
    const notificationsCleared = {
      deletedIds: notificationsToClear[userId]
    };
    getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared});
  });
};

export default publishNotifications;
