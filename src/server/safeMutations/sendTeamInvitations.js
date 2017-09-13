import getRethink from 'server/database/rethinkDriver';
import emailTeamInvitations from 'server/safeMutations/emailTeamInvitations';
import shortid from 'shortid';
import {TEAM_INVITE} from 'universal/utils/constants';

const sendTeamInvitations = async (invitees, inviter) => {
  if (invitees.length === 0) return [];
  const r = getRethink();
  const now = new Date();
  const {orgId, inviterName, teamId, teamName} = inviter;
  const invitations = invitees
    .filter((invitee) => invitee.isUser)
    .map((invitee) => ({
      id: shortid.generate(),
      type: TEAM_INVITE,
      startAt: now,
      orgId,
      userIds: [invitee.userId],
      inviterName,
      teamId,
      teamName
    }));

  await Promise.all([
    r.table('Notification').insert(invitations),
    emailTeamInvitations(invitees, inviter)
  ]);

  const notificationsToAdd = {};
  invitations.forEach((notification) => {
    notificationsToAdd[notification.userIds[0]] = [notification];
  });
  return notificationsToAdd;
};

export default sendTeamInvitations;
