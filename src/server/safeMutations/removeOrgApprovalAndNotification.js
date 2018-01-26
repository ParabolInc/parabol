import getRethink from 'server/database/rethinkDriver';
import {APPROVED, DENIED, PENDING} from 'server/utils/serverConstants';
import {REQUEST_NEW_USER} from 'universal/utils/constants';
import archiveProjectsForDB from 'server/safeMutations/archiveProjectsForDB';

const removeOrgApprovalAndNotification = async (orgId, maybeEmails, type) => {
  const now = new Date();
  const {approvedBy, deniedBy} = type;
  const status = approvedBy ? APPROVED : DENIED;
  const emails = Array.isArray(maybeEmails) ? maybeEmails : [maybeEmails];
  const r = getRethink();
  const {removedOrgApprovals, removedRequestNotifications, softUpdates} = await r({
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
      .default([]),
    softUpdates: r.table('Team')
      .getAll(orgId, {index: 'orgId'})('id')
      .default([])
      .do((teamIds) => {
        return r.table('SoftTeamMember')
          .getAll(r.args(teamIds), {index: 'teamId'})
          .update({isActive: false}, {returnChanges: true})('changes')('new_val')('id')
          .default([])
          .do((softTeamMemberIds) => ({
            softTeamMemberIds,
            softProjectsToArchive: r.table('Project')
              .getAll(r.args(softTeamMemberIds), {index: 'assigneeId'})
              .default([])
          }));
      })
  });
  const {softTeamMemberIds, softProjectsToArchive} = softUpdates;
  if (softProjectsToArchive.length > 0) {
    await archiveProjectsForDB(softProjectsToArchive);
  }
  return {
    softTeamMemberIds,
    archivedSoftProjectIds: softProjectsToArchive.map(({id}) => id),
    removedOrgApprovals,
    removedRequestNotifications
  };
};

export default removeOrgApprovalAndNotification;
