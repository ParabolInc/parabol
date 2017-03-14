import getRethink from 'server/database/rethinkDriver';
import {REQUEST_NEW_USER} from 'universal/utils/constants';

export default function removeOrgApprovalAndNotification(orgId, maybeEmails) {
  const emails = Array.isArray(maybeEmails) ? maybeEmails : [maybeEmails];
  const r = getRethink();
  return r.table('OrgApproval')
    .getAll(r.args(emails), {index: 'email'})
    .filter({orgId})
    .delete()
    .do(() => {
      return r.table('Notification')
        .getAll(orgId, {index: 'orgId'})
        .filter({
          type: REQUEST_NEW_USER
        })
        .filter((notification) => {
          return r.expr(emails).contains(notification('varList')(2));
        })
        // get the inviterName
        .delete({returnChanges: true})('changes')
        .map((change) => change('old_val')('varList'))
        .map((varList) => ({
          inviterId: varList(0),
          inviteeEmail: varList(2),
          invitedTeamId: varList(3)
        }))
        .default([]);
    });
}
