import asyncInviteTeam from 'server/safeMutations/asyncInviteTeam';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';

export default async function inviteAsBillingLeader(invitees, orgId, inviterUserId, teamId) {
  const inviteeEmails = invitees.map((i) => i.email);
  // remove queued approvals
  const promises = [
    removeOrgApprovalAndNotification(orgId, inviteeEmails),
    asyncInviteTeam(inviterUserId, teamId, invitees)
  ];
  await Promise.all(promises);
}
