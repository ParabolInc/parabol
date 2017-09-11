import getAction from 'server/graphql/mutations/helpers/inviteTeamMembers/getAction';

const makeDetailedInvitations = (teamMembers, emailArr = [], users = [], pendingApprovals = [], pendingInvitations = [], inviter = {}) => {
  const {orgId, isBillingLeader} = inviter;
  return emailArr.map((email) => {
    const userDoc = users.find((user) => user.email === email);
    const teamMemberDoc = teamMembers.find((m) => m.email === email);
    const details = {
      email,
      isActiveTeamMember: teamMemberDoc && teamMemberDoc.isNotRemoved,
      isPendingApproval: pendingApprovals.includes(email),
      isPendingInvitation: pendingInvitations.includes(email),
      isUser: Boolean(userDoc),
      isActiveUser: userDoc && !userDoc.inactive,
      isOrgMember: userDoc && Boolean(userDoc.userOrgs.find((userDocOrg) => userDocOrg.id === orgId)),
      isNewTeamMember: !teamMemberDoc,
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
