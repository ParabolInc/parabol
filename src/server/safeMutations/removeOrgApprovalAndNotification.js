import getRethink from 'server/database/rethinkDriver';
import getPubSub from 'server/utils/getPubSub';
import {APPROVED, DENIED, PENDING} from 'server/utils/serverConstants';
import {NOTIFICATIONS_CLEARED, ORG_APPROVAL_REMOVED, REQUEST_NEW_USER} from 'universal/utils/constants';

const publishRemovedApprovals = (removedApprovals, {operationId}) => {
  removedApprovals.forEach((orgApproval) => {
    const {teamId} = orgApproval;
    const orgApprovalRemoved = {orgApproval};
    getPubSub().publish(`${ORG_APPROVAL_REMOVED}.${teamId}`, {orgApprovalRemoved, operationId});
  });
};

const publishRemovedNotifications = (removedNotifications, {operationId}) => {
  removedNotifications.forEach((removedNotification) => {
    const notificationsCleared = {deletedIds: [removedNotification.id]};
    removedNotification.userIds.forEach((userId) => {
      getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared, operationId});
    });
  });
};

const removeOrgApprovalAndNotification = async (orgId, maybeEmails, type, subOptions) => {
  const now = new Date();
  const {approvedBy, deniedBy} = type;
  const status = approvedBy ? APPROVED : DENIED;
  const emails = Array.isArray(maybeEmails) ? maybeEmails : [maybeEmails];
  const r = getRethink();
  const removedApprovalsAndNotification = await r({
    removedApprovals: r.table('OrgApproval')
      .getAll(r.args(emails), {index: 'email'})
      .filter({orgId, status: PENDING})
      .update({
        status,
        approvedBy,
        deniedBy,
        updatedAt: now
      }, {returnChanges: true})('changes')('new_val')
      .default([]),
    removedNotifications: r.table('Notification')
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
  const {removedNotifications, removedApprovals} = removedApprovalsAndNotification;
  publishRemovedApprovals(removedApprovals, subOptions);
  publishRemovedNotifications(removedNotifications, subOptions);
  return removedApprovalsAndNotification;
};

export default removeOrgApprovalAndNotification;
