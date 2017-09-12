import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import asyncInviteTeam from 'server/safeMutations/asyncInviteTeam';
import getInviterInfoAndTeamName from 'server/graphql/models/Invitation/inviteTeamMembers/getInviterInfoAndTeamName';
import DefaultRemovalPayload from 'server/graphql/types/DefaultRemovalPayload';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATIONS_CLEARED} from 'universal/utils/constants';
import sendInvitationViaNotification from 'server/safeMutations/sendInvitationViaNotification';

export default {
  type: new GraphQLNonNull(DefaultRemovalPayload),
  description: 'Approve an outsider to join the organization',
  args: {
    dbNotificationId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The notification the billing leader is accepting'
    }
  },
  async resolve(source, {dbNotificationId}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const userId = getUserId(authToken);
    const notification = await r.table('Notification').get(dbNotificationId);
    await requireNotificationOwner(userId, notification);

    // RESOLUTION
    const {inviterUserId, teamId, inviteeEmail, orgId, userIds} = notification;
    const {inviterName, teamName} = await getInviterInfoAndTeamName(teamId, inviterUserId);
    const inviterDetails = {
      inviterName,
      teamName,
      orgId,
      teamId
    };

    // invitee
    const invitee = await r.table('User')
      .getAll(inviteeEmail, {index: 'email'})
      .nth(0)
      .pluck('inactive')
      .default(null);

    const invitees = [{email: inviteeEmail}];
    const isActive = invitee && !invitee.inactive;
    if (isActive) {
      await sendInvitationViaNotification(invitees, inviterDetails);
    } else {
      await asyncInviteTeam(inviterUserId, teamId, invitees);
    }
    const notificationsCleared = {deletedIds: [dbNotificationId]};
    userIds.forEach((notifiedUserId) => {
      getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${notifiedUserId}`, {notificationsCleared, mutatorId: socket.id});
    });
    return {deletedId: dbNotificationId};
  }
};

