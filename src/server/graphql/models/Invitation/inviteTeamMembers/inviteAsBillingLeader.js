import getRethink from 'server/database/rethinkDriver';
import asyncInviteTeam from './asyncInviteTeam';
import {REQUEST_NEW_USER} from 'universal/utils/constants';

export default async function inviteAsBillingLeader(invitees, orgId, authToken, teamId) {
  const r = getRethink();

  const inviteeEmails = invitees.map((i) => i.email);
  // remove queued approvals
  const promises = [
    r.table('OrgApproval')
      .getAll(r.args(inviteeEmails), {index: 'email'})
      .filter({orgId})
      .delete()
      .do(() => {
        // remove notifications about queued approvals
        return r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter({
            type: REQUEST_NEW_USER
          })
          .filter((notification) => {
            return r.expr(inviteeEmails).contains(notification('varList')(2))
          })
          .delete()
      }),
    asyncInviteTeam(authToken, teamId, invitees)
  ];
  await Promise.all(promises);
}
