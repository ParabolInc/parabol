import getRethink from 'server/database/rethinkDriver';
import getResults from 'server/graphql/mutations/helpers/inviteTeamMembers/getResults';
import makeDetailedInvitations from 'server/graphql/mutations/helpers/inviteTeamMembers/makeDetailedInvitations';
import createPendingApprovals from 'server/safeMutations/createPendingApprovals';
import reactivateTeamMembersAndMakeNotifications from 'server/safeMutations/reactivateTeamMembersAndMakeNotifications';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import getPendingInvitations from 'server/safeQueries/getPendingInvitations';
import {isBillingLeader} from 'server/utils/authorization';
import publishNotifications from 'server/utils/publishNotifications';
import {ASK_APPROVAL, DENIED, PENDING, REACTIVATE, SEND_INVITATION} from 'server/utils/serverConstants';
import mergeObjectsWithArrValues from 'universal/utils/mergeObjectsWithArrValues';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';
import approveToOrg from 'server/safeMutations/approveToOrg';

const safeApproveToOrg = async (...args) => {
  let res = {};
  try {
    res = await approveToOrg(...args);
  } catch (e) {
    // noop
  }
  return res;
};

const approvePendingApprovals = async (orgApprovals, inviter, subOptions) => {
  //
  const {orgId, teamId, userId} = inviter;
  if (!inviter.isBillingLeader) return undefined;
  const otherPendingApprovals = orgApprovals.filter((approval) => approval.status === PENDING && approval.teamId !== teamId);
  const results = await Promise.all(otherPendingApprovals.map((approval) => {
    return safeApproveToOrg(approval.email, orgId, userId, subOptions);
  }));
  return mergeObjectsWithArrValues(...results);
};

const inviteTeamMembers = async (invitees, teamId, userId, dataLoader, mutatorId) => {
  const operationId = dataLoader.share();
  const subOptions = {mutatorId, operationId};
  const r = getRethink();
  const {name: teamName, orgId} = await r.table('Team').get(teamId).pluck('name', 'orgId');

  const emailArr = invitees.map((invitee) => invitee.email);
  const {
    inviterDoc,
    pendingInvitations,
    orgApprovals,
    teamMembers,
    users
  } = await r.expr({
    pendingInvitations: getPendingInvitations(emailArr, teamId)('email')
      .coerceTo('array'),
    orgApprovals: r.table('OrgApproval')
      .getAll(r.args(emailArr), {index: 'email'})
      .filter({orgId, isActive: true})
      .filter((doc) => doc('status').ne(DENIED))
      .coerceTo('array'),
    teamMembers: r.table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .coerceTo('array'),
    users: r.table('User')
      .getAll(r.args(emailArr), {index: 'email'})
      .coerceTo('array'),
    inviterDoc: r.table('User').get(userId)
      .pluck('email', 'picture', 'preferredName', 'userOrgs')
  });
  const userOrgDoc = inviterDoc.userOrgs.find((userOrg) => userOrg.id === orgId);
  const inviter = {
    userOrgs: inviterDoc.userOrgs,
    inviterAvatar: inviterDoc.picture,
    inviterEmail: inviterDoc.email,
    inviterName: inviterDoc.preferredName,
    orgId,
    teamId,
    teamName,
    userId,
    isBillingLeader: isBillingLeader(userOrgDoc)
  };
  const detailedInvitations = makeDetailedInvitations(teamMembers, emailArr, users, orgApprovals, pendingInvitations, inviter);
  const inviteesToReactivate = detailedInvitations.filter(({action}) => action === REACTIVATE);
  const inviteesToInvite = detailedInvitations.filter(({action}) => action === SEND_INVITATION);
  const inviteesNeedingApproval = detailedInvitations.filter(({action}) => action === ASK_APPROVAL);
  const pendingApprovalEmails = inviteesNeedingApproval.map(({email}) => email);
  const approvalsToClear = inviteesToInvite.map(({email}) => email);
  const {reactivations, notificationsToClear, teamInvites, newPendingApprovals} = await resolvePromiseObj({
    // leave out the mutatorId so the sender gets the full team member (should refactor when completey on relay)
    reactivations: reactivateTeamMembersAndMakeNotifications(inviteesToReactivate, inviter, teamMembers, subOptions),
    notificationsToClear: removeOrgApprovalAndNotification(orgId, approvalsToClear, {approvedBy: userId}),
    approvePendingApprovals: approvePendingApprovals(orgApprovals, inviter, subOptions),
    teamInvites: sendTeamInvitations(inviteesToInvite, inviter, undefined, subOptions),
    newPendingApprovals: createPendingApprovals(pendingApprovalEmails, inviter, subOptions)
  });

  const notificationsToAdd = mergeObjectsWithArrValues(reactivations, teamInvites, newPendingApprovals);
  publishNotifications({notificationsToAdd, notificationsToClear});
  const results = getResults(detailedInvitations);
  return {results};
};

export default inviteTeamMembers;
