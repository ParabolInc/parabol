import getAction from 'server/graphql/mutations/helpers/inviteTeamMembers/getAction';
import {APPROVED, PENDING} from 'server/utils/serverConstants';

const makeDetailedInvitations = (teamMembers, emailArr = [], users = [], orgApprovals = [], pendingInvitations = [], inviter = {}) => {
  const {orgId, isBillingLeader, teamId} = inviter;
  const pendingTeamApprovals = orgApprovals.filter((approval) => approval.teamId === teamId && approval.status === PENDING);
  const approvedOrgApprovals = orgApprovals.filter((approval) => approval.status === APPROVED);
  return emailArr.map((email) => {
    const userDoc = users.find((user) => user.email === email);
    const teamMemberDoc = teamMembers.find((m) => m.email === email);
    const details = {
      email,
      isActiveTeamMember: teamMemberDoc && teamMemberDoc.isNotRemoved,
      isPendingApproval: Boolean(pendingTeamApprovals.find((approval) => approval.email === email)),
      isPendingInvitation: pendingInvitations.includes(email),
      isUser: Boolean(userDoc),
      isOrgMember: userDoc && Boolean(userDoc.userOrgs.find((userDocOrg) => userDocOrg.id === orgId)),
      isNewTeamMember: !teamMemberDoc,
      teamMemberId: teamMemberDoc && teamMemberDoc.id,
      userId: userDoc && userDoc.id,
      preferredName: userDoc && userDoc.preferredName,
      isApproved: Boolean(approvedOrgApprovals.find((approval) => approval.email === email)) || isBillingLeader || false
    };
    return {
      ...details,
      action: getAction(details)
    };
  });
};

export default makeDetailedInvitations;
