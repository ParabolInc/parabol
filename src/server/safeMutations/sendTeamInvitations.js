import getRethink from 'server/database/rethinkDriver';
import emailTeamInvitations from 'server/safeMutations/emailTeamInvitations';
import getPubSub from 'server/utils/getPubSub';
import {APPROVED} from 'server/utils/serverConstants';
import shortid from 'shortid';
import {NOTIFICATIONS_ADDED, TEAM_INVITE} from 'universal/utils/constants';

const maybeAutoApproveToOrg = (invitees, inviter) => {
  const r = getRethink();
  const now = new Date();
  const {orgId, teamId} = inviter;
  if (!inviter.isBillingLeader) return undefined;
  const approvals = invitees.map((invitee) => ({
    id: shortid.generate(),
    createdAt: now,
    email: invitee.email,
    isActive: true,
    orgId,
    status: APPROVED,
    teamId,
    updatedAt: now
  }));
  return r.table('OrgApproval').insert(approvals);
};

const publishTeamInvites = (invitations, {operationId}) => {
  // do not filter out duplicates like we do for the DB insert!
  // that way if someone resends an invite, the invitee will always get a toast
  invitations.forEach((notification) => {
    const userId = notification.userIds[0];
    const notificationsAdded = {notifications: [notification]};
    getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded, operationId});
  });
};

const sendTeamInvitations = async (invitees, inviter, inviteId, subOptions) => {
  if (invitees.length === 0) return [];
  const r = getRethink();
  const now = new Date();
  const {orgId, inviterName, teamId, teamName} = inviter;
  const inviteeUsers = invitees.filter((invitee) => Boolean(invitee.userId));

  const invitations = inviteeUsers
    .map((invitee) => ({
      id: shortid.generate(),
      type: TEAM_INVITE,
      startAt: now,
      orgId,
      userIds: [invitee.userId],
      inviteeEmail: invitee.email,
      inviterName,
      teamId,
      teamName
    }));

  const userIds = inviteeUsers.map(({userId}) => userId);
  await Promise.all([
    r.table('Notification')
      .getAll(r.args(userIds), {index: 'userIds'})
      .filter({type: TEAM_INVITE, teamId})('userIds')(0).default([])
      .do((userIdsWithNote) => {
        return r.expr(invitations).filter((invitation) => userIdsWithNote.contains(invitation('userIds')(0)).not());
      })
      .do((newNotifications) => r.table('Notification').insert(newNotifications)),
    emailTeamInvitations(invitees, inviter, inviteId, subOptions),
    maybeAutoApproveToOrg(invitees, inviter)
  ]);

  publishTeamInvites(invitations, subOptions);
};

export default sendTeamInvitations;
