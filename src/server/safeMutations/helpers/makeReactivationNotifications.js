import {REJOIN_TEAM} from 'universal/utils/constants';


const makeReactivationNotifications = (notifications, reactivatedUsers, teamMembers, inviter) => {
  const {teamName, userId} = inviter;
  const restOfTeamUserIds = teamMembers
    .filter((m) => m.isNotRemoved === true && m.id !== userId)
    .map((m) => m.userId);
  const notificationsToSend = {};
  reactivatedUsers.forEach((user, idx) => {
    const notification = notifications[idx];
    const {preferredName, id: reactivatedUserId} = user;

    // make a notification to the person being reactivated
    notificationsToSend[reactivatedUserId] = [notification];

    // make a notification for the other team members annoucing the reactivation
    const rejoinNotification = {
      teamName,
      preferredName,
      type: REJOIN_TEAM
    };
    restOfTeamUserIds.forEach((notificationUserId) => {
      if (inviter.userId === notificationUserId) return;
      notificationsToSend[notificationUserId] = notificationsToSend[notificationUserId] || [];
      notificationsToSend[notificationUserId].push(rejoinNotification);
    });
  });
  return notificationsToSend;
};

export default makeReactivationNotifications;
