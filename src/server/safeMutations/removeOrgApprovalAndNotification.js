import getRethink from 'server/database/rethinkDriver';
import {APPROVED, DENIED, PENDING} from 'server/utils/serverConstants';
import {REQUEST_NEW_USER} from 'universal/utils/constants';

const removeOrgApprovalAndNotification = async (orgId, maybeEmails, type) => {
  const now = new Date();
  const {approvedBy, deniedBy} = type;
  const status = approvedBy ? APPROVED : DENIED;
  const emails = Array.isArray(maybeEmails) ? maybeEmails : [maybeEmails];
  const r = getRethink();
  const {removedOrgApprovals, removedRequestNotifications} = await r({
    removedOrgApprovals: r.table('OrgApproval')
      .getAll(r.args(emails), {index: 'email'})
      .filter({orgId, status: PENDING})
      .update({
        status,
        approvedBy,
        deniedBy,
        updatedAt: now
      }, {returnChanges: true})('changes')('new_val')
      .default([]),
    removedRequestNotifications: r.table('Notification')
      .getAll(orgId, {index: 'orgId'})
      .filter({
        type: REQUEST_NEW_USER
      })
      .filter((notification) => {
        return r.expr(emails).contains(notification('inviteeEmail'));
      })
      // get the inviterName
      .delete({returnChanges: true})('changes')('old_val')
      .default([])
  });

  return {
    removedOrgApprovals,
    removedRequestNotifications
  };
};

export default removeOrgApprovalAndNotification;
