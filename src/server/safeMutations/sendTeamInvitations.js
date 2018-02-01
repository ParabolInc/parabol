import getRethink from 'server/database/rethinkDriver';
import emailTeamInvitations from 'server/safeMutations/emailTeamInvitations';
import {APPROVED} from 'server/utils/serverConstants';
import shortid from 'shortid';
import {TEAM_INVITE} from 'universal/utils/constants';
import promiseAllObj from 'universal/utils/promiseAllObj';
import makeNewSoftTeamMembers from 'server/safeMutations/makeNewSoftTeamMembers';

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

const sendTeamInvitations = async (invitees, inviter, inviteId, dataLoader) => {
  if (invitees.length === 0) {
    return {
      newInvitations: [],
      updatedInvitations: [],
      teamInviteNotifications: [],
      newSoftTeamMembers: []
    };
  }
  const r = getRethink();
  const now = new Date();
  const {orgId, inviterName, inviterUserId, teamId, teamName} = inviter;
  const inviteeUsers = invitees.filter((invitee) => Boolean(invitee.userId));

  const teamInviteNotifications = inviteeUsers
    .map((invitee) => ({
      id: shortid.generate(),
      type: TEAM_INVITE,
      startAt: now,
      orgId,
      userIds: [invitee.userId],
      inviteeEmail: invitee.email,
      inviterUserId,
      inviterName,
      teamId,
      teamName
    }));

  const userIds = inviteeUsers.map(({userId}) => userId);
  const {upsertedInvitations} = await promiseAllObj({
    newNotifications: r.table('Notification')
      .getAll(r.args(userIds), {index: 'userIds'})
      .filter({type: TEAM_INVITE, teamId})('userIds')(0).default([])
      .do((userIdsWithNote) => {
        return r.expr(teamInviteNotifications).filter((invitation) => userIdsWithNote.contains(invitation('userIds')(0)).not());
      })
      .do((newNotifications) => r.table('Notification').insert(newNotifications)),
    upsertedInvitations: emailTeamInvitations(invitees, inviter, inviteId),
    autoApprove: maybeAutoApproveToOrg(invitees, inviter)
  });

  const inviteeEmails = invitees.map(({email}) => email);
  const newSoftTeamMembers = await makeNewSoftTeamMembers(inviteeEmails, teamId, dataLoader);

  return {
    ...upsertedInvitations,
    newSoftTeamMembers,
    teamInviteNotifications
  };
};

export default sendTeamInvitations;
