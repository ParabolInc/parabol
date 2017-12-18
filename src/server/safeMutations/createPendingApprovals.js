import getRethink from 'server/database/rethinkDriver';
import getPubSub from 'server/utils/getPubSub';
import {PENDING} from 'server/utils/serverConstants';
import shortid from 'shortid';
import {BILLING_LEADER, ORG_APPROVAL_ADDED, REQUEST_NEW_USER} from 'universal/utils/constants';

export default async function createPendingApprovals(outOfOrgEmails, inviteSender, {operationId} = {}) {
  if (outOfOrgEmails.length === 0) return [];
  const {orgId, teamId, teamName, userId} = inviteSender || {};
  const r = getRethink();
  const now = new Date();
  // add a notification to the Billing Leaders
  const {userIds, inviter} = await r({
    userIds: r.table('User')
      .getAll(orgId, {index: 'userOrgs'})
      .filter((user) => user('userOrgs')
        .contains((userOrg) => userOrg('id').eq(orgId).and(userOrg('role').eq(BILLING_LEADER))))('id')
      .coerceTo('array'),
    inviter: r.table('User').get(userId).pluck('preferredName', 'id')
  });
  const notifications = outOfOrgEmails.map((inviteeEmail) => ({
    id: shortid.generate(),
    type: REQUEST_NEW_USER,
    startAt: now,
    orgId,
    userIds,
    inviterUserId: inviter.id,
    inviterName: inviter.preferredName,
    inviteeEmail,
    teamId,
    teamName
  }));

  const pendingApprovals = outOfOrgEmails.map((inviteeEmail) => ({
    id: shortid.generate(),
    createdAt: now,
    email: inviteeEmail,
    isActive: true,
    orgId,
    status: PENDING,
    teamId,
    updatedAt: now
  }));
  // send a new notification to each Billing Leader concerning each out-of-org invitee
  await r({
    notifications: r.table('Notification').insert(notifications),
    approvals: r.table('OrgApproval').insert(pendingApprovals)
  });
  const pendingApprovalNotifications = {};
  notifications.forEach((notification) => {
    notification.userIds.forEach((notifiedUserId) => {
      pendingApprovalNotifications[notifiedUserId] = pendingApprovalNotifications[notifiedUserId] || [];
      pendingApprovalNotifications[notifiedUserId].push(notification);
    });
  });
  pendingApprovals.forEach((orgApproval) => {
    const orgApprovalAdded = {orgApproval};
    getPubSub().publish(`${ORG_APPROVAL_ADDED}.${teamId}`, {orgApprovalAdded, operationId});
  });
  return pendingApprovalNotifications;
}
