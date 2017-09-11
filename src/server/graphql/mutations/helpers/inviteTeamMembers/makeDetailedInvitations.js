import getAction from 'server/graphql/mutations/helpers/inviteTeamMembers/getAction';

const makeDetailedInvitations = (teamMembers, emailArr, users, pendingApprovals, pendingInvitations, inviter) => {
  const {orgId, isBillingLeader} = inviter;
  const activeTeamMembers = teamMembers.filter((m) => m.isNotRemoved === true).map((m) => m.email);
  const inactiveTeamMembers = teamMembers.filter((m) => !m.isNotRemoved).map((m) => m.email);
  return emailArr.map((email) => {
    const userDoc = users.find((user) => user.email === email);
    const details = {
      email,
      isActiveTeamMember: activeTeamMembers.includes(email),
      isPendingApproval: pendingApprovals.includes(email),
      isPendingInvitation: pendingInvitations.includes(email),
      isUser: Boolean(userDoc),
      isActiveUser: userDoc && !userDoc.inactive,
      isOrgMember: userDoc && userDoc.userOrgs.includes((userDocOrg) => userDocOrg.id === orgId),
      isNewTeamMember: !inactiveTeamMembers.includes((tm) => tm.email === email),
      userId: userDoc && userDoc.id,
      preferredName: userDoc && userDoc.preferredName
    };
    return {
      ...details,
      action: getAction(details, isBillingLeader)
    };
  });
};

export default makeDetailedInvitations;