import getRethink from 'server/database/rethinkDriver';
import shortid from 'shortid';
import {BILLING_LEADER, REQUEST_NEW_USER} from 'universal/utils/constants';

export default async function createPendingApprovals(outOfOrgEmails, orgId, teamId, teamName, userId) {
  const r = getRethink();
  const now = new Date();
  // add a notification to the billing leaders
  const {userIds, inviter} = await r.expr({
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
    varList: [inviter.id, inviter.preferredName, inviteeEmail, teamId, teamName]
  }));

  const pendingApprovals = outOfOrgEmails.map((inviteeEmail) => ({
    id: shortid.generate(),
    createdAt: now,
    email: inviteeEmail,
    orgId,
    teamId
  }));
  // send a new notification to each billing leader concerning each out-of-org invitee
  await r.table('Notification').insert(notifications)
    .do(() => {
      return r.table('OrgApproval').insert(pendingApprovals);
    });
}
