import getRethink from 'server/database/rethinkDriver';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import getPubSub from 'server/utils/getPubSub';
import publishNotifications from 'server/utils/publishNotifications';
import {APPROVED, PENDING} from 'server/utils/serverConstants';
import shortid from 'shortid';
import {
  INVITEE_APPROVED,
  NOTIFICATIONS_CLEARED,
  ORG_APPROVAL_REMOVED,
  REQUEST_NEW_USER
} from 'universal/utils/constants';
import mergeObjectsWithArrValues from 'universal/utils/mergeObjectsWithArrValues';

const approveToOrg = async (email, orgId, userId, subParams) => {
  const {mutatorId, operationId} = subParams;
  const r = getRethink();
  const now = new Date();
  // get all notifications for this email to join this org
  const notifications = await r.table('Notification')
    .getAll(userId, {index: 'userIds'})
    .filter({
      orgId,
      type: REQUEST_NEW_USER,
      inviteeEmail: email
    })
    .delete({returnChanges: true})('changes')('old_val')
    .default([]);
  if (notifications.length === 0) {
    throw new Error('Notification not found!');
  }
  // RESOLUTION
  // send 1 team invite per notification

  const deletedIds = notifications.map(({id}) => id);
  const inviterUserIds = Array.from(notifications.reduce((userIds, notification) => {
    return userIds.add(notification.inviterUserId);
  }, new Set()));

  const teamIds = notifications.map(({teamId}) => teamId);
  const {inviterUsers, teams} = await r({
    inviterUsers: r.table('User')
      .getAll(r.args(inviterUserIds), {index: 'id'})
      .pluck('id', 'email', 'picture', 'preferredName')
      .coerceTo('array'),
    teams: r.table('Team')
      .getAll(r.args(teamIds), {index: 'id'})
      .pluck('id', 'name')
      .coerceTo('array')
  });
  const inviters = notifications.map((notification) => {
    const inviterUser = inviterUsers.find(({id}) => id === notification.inviterUserId);
    const team = teams.find(({id}) => id === notification.teamId);
    return {
      inviterAvatar: inviterUser.picture,
      inviterEmail: inviterUser.email,
      inviterName: inviterUser.preferredName,
      teamName: team.name,
      orgId,
      teamId: team.id,
      userId: inviterUser.id
    };
  });
  const inviteeApprovedNotifications = inviters.map((inviter) => {
    const {inviterName, userId: inviterUserId, teamId, teamName} = inviter;
    return {
      id: shortid.generate(),
      type: INVITEE_APPROVED,
      startAt: now,
      orgId,
      userIds: [inviterUserId],
      inviteeEmail: email,
      inviterName,
      teamId,
      teamName
    };
  });
  const inviteeApprovedNotificationsByUserId = {};
  inviteeApprovedNotifications.forEach((notification) => {
    const inviterUserId = notification.userIds[0];
    inviteeApprovedNotificationsByUserId[inviterUserId] = inviteeApprovedNotificationsByUserId[inviterUserId] || [];
    inviteeApprovedNotificationsByUserId[inviterUserId].push(notification);
  });
  // tell the inviters that their friend was approved
  // send the invitee a series of team invites
  const {inviteeUser, orgApprovals} = await r({
    insertInviteeApproved: r.table('Notification').insert(inviteeApprovedNotifications),
    orgApprovals: r.table('OrgApproval')
      .getAll(email, {index: 'email'})
      .filter({orgId, status: PENDING, isActive: true})
      .update({
        status: APPROVED,
        approvedBy: userId,
        updatedAt: now
      }, {returnChanges: true})('changes')('new_val').default([]),
    inviteeUser: r.table('User').getAll(email, {index: 'email'}).nth(0).default(null)
  });

  const invitees = inviteeUser ? [{email, userId: inviteeUser.id}] : [{email}];

  const teamInvitesToAdd = await Promise.all(inviters.map((inviter) => {
    return sendTeamInvitations(invitees, inviter);
  }));

  orgApprovals.forEach((orgApproval) => {
    const {teamId} = orgApproval;
    const orgApprovalRemoved = {orgApproval};
    getPubSub().publish(`${ORG_APPROVAL_REMOVED}.${teamId}`, {orgApprovalRemoved, operationId});
  });

  // TEAM_INVITEs + INVITEE_APPROVEDs
  const notificationsToAdd = mergeObjectsWithArrValues(...teamInvitesToAdd, inviteeApprovedNotificationsByUserId);
  publishNotifications({notificationsToAdd});

  // keep this separate so we can include the mutatorId
  const notificationsCleared = {deletedIds};
  notifications[0].userIds.forEach((notifiedUserId) => {
    getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${notifiedUserId}`, {notificationsCleared, mutatorId});
  });
  return notificationsCleared;
};

export default approveToOrg;

