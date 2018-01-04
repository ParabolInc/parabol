import getRethink from 'server/database/rethinkDriver';
import makeDetailedInvitations from 'server/graphql/mutations/helpers/inviteTeamMembers/makeDetailedInvitations';
import createPendingApprovals from 'server/safeMutations/createPendingApprovals';
import reactivateTeamMembersAndMakeNotifications from 'server/safeMutations/reactivateTeamMembersAndMakeNotifications';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import getPendingInvitations from 'server/safeQueries/getPendingInvitations';
import {isBillingLeader} from 'server/utils/authorization';
import {ASK_APPROVAL, DENIED, REACTIVATE, SEND_INVITATION} from 'server/utils/serverConstants';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';

const inviteTeamMembers = async (invitees, teamId, userId) => {
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
  });
  const userOrgDoc = inviterDoc.userOrgs.find((userOrg) => userOrg.id === orgId);
  const inviter = {
    userOrgs: inviterDoc.userOrgs,
    inviterUserId: inviterDoc.id,
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
  const {reactivations, newPendingApprovals, removedApprovalsAndNotifications, teamInvites} = await resolvePromiseObj({
    reactivations: reactivateTeamMembersAndMakeNotifications(inviteesToReactivate, inviter),
    removedApprovalsAndNotifications: removeOrgApprovalAndNotification(orgId, approvalsToClear, {approvedBy: userId}),
    teamInvites: sendTeamInvitations(inviteesToInvite, inviter),
    newPendingApprovals: createPendingApprovals(pendingApprovalEmails, inviter)
  });

  return {
    ...newPendingApprovals,
    ...removedApprovalsAndNotifications,
    ...teamInvites,
    reactivations
  };
};

export default inviteTeamMembers;
