import getRethink from 'server/database/rethinkDriver';
import getPubSub from 'server/utils/getPubSub';
import shortid from 'shortid';
import {NOTIFICATION_ADDED, TEAM_INVITE} from 'universal/utils/constants';

const sendInvitationViaNotification = async (invitees, inviter) => {
  if (invitees.length === 0) return;
  const r = getRethink();
  const now = new Date();
  const {orgId, inviterName, teamId, teamName} = inviter;
  const invitations = invitees.map((invitee) => ({
    id: shortid.generate(),
    type: TEAM_INVITE,
    startAt: now,
    orgId,
    userIds: [invitee.userId],
    inviterName,
    teamId,
    teamName
  }));
  await r.table('Notification').insert(invitations);
  invitations.forEach((notification) => {
    const notificationAdded = {notification};
    getPubSub().publish(`${NOTIFICATION_ADDED}.${notification.userId}`, {notificationAdded});
  });
};

export default sendInvitationViaNotification;
