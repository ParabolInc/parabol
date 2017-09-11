import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATIONS_ADDED, NOTIFICATIONS_CLEARED} from 'universal/utils/constants';
import mergeObjectsWithArrValues from 'universal/utils/mergeObjectsWithArrValues';

const publishNotifications = (notificationsToSend) => {
  const {
    reactivation,
    notificationsToClear,
    teamInvite,
    approval
  } = notificationsToSend;

  const allNotificationsToAdd = mergeObjectsWithArrValues(reactivation, teamInvite, approval);
  Object.keys(allNotificationsToAdd).forEach((userId) => {
    const notificationsAdded = {
      notifications: allNotificationsToAdd[userId]
    };
    getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded});
  });
  Object.keys(notificationsToClear).forEach((userId) => {
    const notificationsCleared = notificationsToClear[userId];
    getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared});
  });
};

export default publishNotifications;
