import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import NotificationsClearedPayload from 'server/graphql/types/NotificationsClearedPayload';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import {getUserId, getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import publishNotifications from 'server/utils/publishNotifications';
import {APPROVED, PENDING} from 'server/utils/serverConstants';
import * as shortid from 'shortid';
import {INVITEE_APPROVED, NOTIFICATIONS_CLEARED, REQUEST_NEW_USER} from 'universal/utils/constants';
import mergeObjectsWithArrValues from 'universal/utils/mergeObjectsWithArrValues';


export default {
  type: new GraphQLNonNull(NotificationsClearedPayload),
  description: 'Approve an outsider to join the organization',
  args: {
    email: {
      type: new GraphQLNonNull(GraphQLString)
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(source, {email, orgId}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const userId = getUserId(authToken);
    const userOrgDoc = await getUserOrgDoc(userId, orgId);
    requireOrgLeader(userOrgDoc);

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
    await r({
      insertInviteeApproved: r.table('Notification').insert(inviteeApprovedNotifications),
      approveToOrg: r.table('OrgApproval')
        .getAll(email, {index: 'email'})
        .filter({orgId, status: PENDING})
        .update({
          status: APPROVED,
          approvedBy: userId,
          updatedAt: now
        })
    });

    const invitees = [{email}];
    const teamInvitesToAdd = await Promise.all(inviters.map((inviter) => {
      return sendTeamInvitations(invitees, inviter);
    }));

    // TEAM_INVITEs + INVITEE_APPROVEDs
    const notificationsToAdd = mergeObjectsWithArrValues(...teamInvitesToAdd, inviteeApprovedNotificationsByUserId);
    publishNotifications({notificationsToAdd});

    // keep this separate so we can include the mutatorId
    const notificationsCleared = {deletedIds};
    notifications[0].userIds.forEach((notifiedUserId) => {
      getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${notifiedUserId}`, {notificationsCleared, mutatorId: socket.id});
    });
    return notificationsCleared;
  }
};

