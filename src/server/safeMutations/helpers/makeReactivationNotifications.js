import tmsSignToken from 'server/utils/tmsSignToken';
import {ADD_TO_TEAM, REJOIN_TEAM} from 'universal/utils/constants';


const makeReactivationNotifications = (reactivatedUsers, teamMembers, inviter) => {
  const {teamId, teamName, inviterName, userId} = inviter;
  const restOfTeamUserIds = teamMembers
    .filter((m) => m.isNotRemoved === true && m.id !== userId)
    .map((m) => m.userId);
  const notificationsToSend = {};
  reactivatedUsers.forEach((user) => {
    const {preferredName, id: reactivatedUserId, tms} = user;

    // make a notification to the person being reactivated
    notificationsToSend[reactivatedUserId] = [{
      authToken: tmsSignToken({sub: reactivatedUserId}, tms),
      inviterName,
      teamId,
      teamName,
      type: ADD_TO_TEAM
    }];

    // make a notification for the other team members annoucing the reactivation
    const rejoinNotification = {
      teamName,
      preferredName,
      type: REJOIN_TEAM
    };
    restOfTeamUserIds.forEach((notificationUserId) => {
      notificationsToSend[notificationUserId] = [rejoinNotification];
    });
  });
  return notificationsToSend;
};

export default makeReactivationNotifications;
