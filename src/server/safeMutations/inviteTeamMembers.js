import getRethink from 'server/database/rethinkDriver';
import getResults from 'server/graphql/mutations/helpers/inviteTeamMembers/getResults';
import makeDetailedInvitations from 'server/graphql/mutations/helpers/inviteTeamMembers/makeDetailedInvitations';
import publishNotifications from 'server/utils/publishNotifications';
import asyncInviteTeam from 'server/safeMutations/asyncInviteTeam';
import createPendingApprovals from 'server/safeMutations/createPendingApprovals';
import reactivateTeamMembersAndMakeNotifications from 'server/safeMutations/reactivateTeamMembersAndMakeNotifications';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import sendInvitationViaNotification from 'server/safeMutations/sendInvitationViaNotification';
import {isBillingLeader} from 'server/utils/authorization';
import {ASK_APPROVAL, SEND_EMAIL, SEND_NOTIFICATION} from 'server/utils/serverConstants';
import {REACTIVATED, TEAM_INVITE} from 'universal/utils/constants';
import mergeObjectsWithArrValues from 'universal/utils/mergeObjectsWithArrValues';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';

const inviteTeamMembers = async (invitees, teamId, userId) => {
  const r = getRethink();
  const now = Date.now();
  const {name: teamName, orgId} = await r.table('Team').get(teamId).pluck('name', 'orgId');

  const emailArr = invitees.map((invitee) => invitee.email);
  const {
    inviterDoc,
    pendingEmailInvitations,
    pendingNotificationInvitations,
    pendingApprovals,
    teamMembers,
    users
  } = await r.expr({
    pendingEmailInvitations: r.table('Invitation')
      .getAll(r.args(emailArr), {index: 'email'})
      .filter((invitation) => invitation('tokenExpiration').ge(r.epochTime(now)))('email')
      .coerceTo('array'),
    pendingNotificationInvitations: r.table('Notification')
      .getAll(orgId, {index: 'orgId'})
      .filter({
        type: TEAM_INVITE,
        teamId
      })
      .filter((doc) => r.expr(emailArr).includes(doc('inviteeEmail')))('inviteeEmail')
      .coerceTo('array'),
    pendingApprovals: r.table('OrgApproval')
      .getAll(r.args(emailArr), {index: 'email'})
      .filter({teamId})
      .coerceTo('array'),
    teamMembers: r.table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .coerceTo('array'),
    users: r.table('User')
      .getAll(r.args(emailArr), {index: 'email'})
      .coerceTo('array'),
    inviterDoc: r.table('User').get(userId)
      .merge((doc) => ({
        inviterAvatar: doc('picture'),
        inviterEmail: doc('email'),
        inviterName: doc('preferredName')
      }))
      .pluck('email', 'picture', 'preferredName', 'userOrgs')
  });
  const pendingInvitations = pendingEmailInvitations.concat(pendingNotificationInvitations);
  const userOrgDoc = inviterDoc.userOrgs.find((userOrg) => userOrg.id === orgId);
  const inviter = {
    ...inviterDoc,
    userId,
    orgId,
    teamId,
    teamName,
    isBillingLeader: isBillingLeader(userOrgDoc)
  };

  const detailedInvitations = makeDetailedInvitations(teamMembers, emailArr, users, pendingApprovals, pendingInvitations, inviter);
  const inviteesToReactivate = detailedInvitations.filter(({action}) => action === REACTIVATED);
  const inviteesToNotify = detailedInvitations.filter(({action}) => action === SEND_NOTIFICATION);
  const inviteesToEmail = detailedInvitations.filter(({action}) => action === SEND_EMAIL);
  const inviteesToApprove = detailedInvitations.filter(({action}) => action === ASK_APPROVAL);
  const approvalEmails = inviteesToApprove.map(({email}) => email);
  const approvalsToClear = inviteesToNotify.concat(inviteesToEmail).map(({email}) => email);

  const {reactivations, notificationsToClear, teamInvites, approvals} = await resolvePromiseObj({
    reactivations: reactivateTeamMembersAndMakeNotifications(inviteesToReactivate, inviter, teamMembers),
    notificationsToClear: removeOrgApprovalAndNotification(orgId, approvalsToClear),
    teamInvites: sendInvitationViaNotification(inviteesToNotify, inviter),
    approvals: createPendingApprovals(approvalEmails, inviter),
    emailInvites: asyncInviteTeam(userId, teamId, inviteesToEmail)
  });

  const notificationsToAdd = mergeObjectsWithArrValues(reactivations, teamInvites, approvals);
  publishNotifications({notificationsToAdd, notificationsToClear});
  const results = getResults(detailedInvitations);
  return {results};
};

export default inviteTeamMembers;
