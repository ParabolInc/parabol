import getRethink from 'server/database/rethinkDriver';
import {PENDING} from 'server/utils/serverConstants';
import shortid from 'shortid';
import {BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';
import makeNewSoftTeamMembers from 'server/graphql/mutations/helpers/makeNewSoftTeamMembers';

export default async function createPendingApprovals(outOfOrgEmails, inviteSender) {
  if (outOfOrgEmails.length === 0) return {requestNotifications: [], orgApprovalIds: []};
  const {orgId, teamId, userId} = inviteSender || {};
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
  const requestNotifications = outOfOrgEmails.map((inviteeEmail) => ({
    id: shortid.generate(),
    type: REQUEST_NEW_USER,
    startAt: now,
    orgId,
    userIds,
    inviterUserId: inviter.id,
    inviteeEmail,
    teamId
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
    requestNotifications: r.table('Notification').insert(requestNotifications),
    approvals: r.table('OrgApproval').insert(pendingApprovals)
  });

  const newSoftTeamMembers = await makeNewSoftTeamMembers(outOfOrgEmails, teamId);

  return {
    requestNotifications,
    newSoftTeamMembers,
    orgApprovalIds: pendingApprovals.map(({id}) => id),
    billingLeaderUserIds: userIds
  };
}
