import getRethink from 'server/database/rethinkDriver';
import emailTeamInvitations from 'server/safeMutations/emailTeamInvitations';
import shortid from 'shortid';
import {TEAM_INVITE} from 'universal/utils/constants';

const sendTeamInvitations = async (invitees, inviter) => {
  if (invitees.length === 0) return [];
  const r = getRethink();
  const now = new Date();
  const {orgId, inviterName, teamId, teamName} = inviter;
  const userIds = invitees.map(({userId}) => userId).filter(Boolean);
  const invitations = userIds.map((userId) => ({
    id: shortid.generate(),
    type: TEAM_INVITE,
    startAt: now,
    orgId,
    userIds: [userId],
    inviterName,
    teamId,
    teamName
  }));

  await Promise.all([
    r.table('Notification')
      .getAll(r.args(userIds), {index: 'userIds'})
      .filter({type: TEAM_INVITE, orgId})('userIds')(0).default([])
      .do((userIdsWithNote) => {
        return r.expr(invitations).filter((invitation) => userIdsWithNote.contains(invitation('userIds')(0)).not());
      })
      .do((newNotifications) => r.table('Notification').insert(newNotifications)),
    emailTeamInvitations(invitees, inviter)
  ]);

  // do not filter out duplicates! that way if someone resends an invite, the invitee will always get a toast
  const notificationsToAdd = {};
  invitations.forEach((notification) => {
    notificationsToAdd[notification.userIds[0]] = [notification];
  });
  return notificationsToAdd;
};

export default sendTeamInvitations;
