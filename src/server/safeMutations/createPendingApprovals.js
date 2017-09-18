import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';
import {PENDING} from 'server/utils/serverConstants';

export default async function createPendingApprovals(outOfOrgEmails, {orgId, teamId, teamName, userId} = {}) {
  if (outOfOrgEmails.length === 0) return [];
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
    orgId,
    status: PENDING,
    teamId
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
  return pendingApprovalNotifications;
}
