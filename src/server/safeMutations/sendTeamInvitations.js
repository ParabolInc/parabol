import getRethink from 'server/database/rethinkDriver';
import emailTeamInvitations from 'server/safeMutations/emailTeamInvitations';
import {APPROVED} from 'server/utils/serverConstants';
import shortid from 'shortid';
import {TEAM_INVITE} from 'universal/utils/constants';

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

const sendTeamInvitations = async (invitees, inviter, inviteId) => {
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
      .filter({type: TEAM_INVITE, orgId})('userIds')(0).default([])
      .do((userIdsWithNote) => {
        return r.expr(invitations).filter((invitation) => userIdsWithNote.contains(invitation('userIds')(0)).not());
      })
      .do((newNotifications) => r.table('Notification').insert(newNotifications)),
    emailTeamInvitations(invitees, inviter, inviteId),
    maybeAutoApproveToOrg(invitees, inviter)
  ]);

  // do not filter out duplicates! that way if someone resends an invite, the invitee will always get a toast
  const notificationsToAdd = {};
  invitations.forEach((notification) => {
    notificationsToAdd[notification.userIds[0]] = [notification];
  });
  return notificationsToAdd;
};

export default sendTeamInvitations;
