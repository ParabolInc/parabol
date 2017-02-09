import getRethink from 'server/database/rethinkDriver';
import {REQUEST_NEW_USER} from 'universal/utils/constants';

export default async function removeOrgApprovalAndNotification(orgId, maybeEmails) {
  const emails = Array.isArray(maybeEmails) ? maybeEmails : [maybeEmails];
  const r = getRethink();
  return await r.table('OrgApproval')
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
          return r.expr(emails).contains(notification('varList')(2))
        })
        // get the inviterName
        .delete({returnChanges: true})('changes')(0)('old_val')('varList')(0).default(null)
    })
}
