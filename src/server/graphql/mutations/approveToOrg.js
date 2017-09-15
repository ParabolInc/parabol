import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import getInviterInfoAndTeamName from 'server/graphql/models/Invitation/inviteTeamMembers/getInviterInfoAndTeamName';
import DefaultRemovalPayload from 'server/graphql/types/DefaultRemovalPayload';
import addInviteeApproved from 'server/safeMutations/helpers/addInviteeApproved';
import removeOrgApprovalAndNotification from 'server/safeMutations/removeOrgApprovalAndNotification';
import sendTeamInvitations from 'server/safeMutations/sendTeamInvitations';
import {getUserId, requireNotificationOwner} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import publishNotifications from 'server/utils/publishNotifications';
import {NOTIFICATIONS_CLEARED} from 'universal/utils/constants';
import mergeObjectsWithArrValues from 'universal/utils/mergeObjectsWithArrValues';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';


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
    requireNotificationOwner(userId, notification);

    // RESOLUTION
    const {inviterUserId, teamId, inviteeEmail, orgId, userIds} = notification;
    const {inviterAvatar, inviterEmail, inviterName, teamName} = await getInviterInfoAndTeamName(teamId, inviterUserId);
    const inviterDetails = {
      inviterAvatar,
      inviterEmail,
      inviterName,
      teamName,
      orgId,
      teamId,
      userId: inviterUserId
    };

    const invitees = [{email: inviteeEmail}];
    const {teamInvitesToAdd, inviteeApprovedToAdd, requestNewUserToClear} = await resolvePromiseObj({
      teamInvitesToAdd: sendTeamInvitations(invitees, inviterDetails),
      requestNewUserToClear: removeOrgApprovalAndNotification(orgId, inviteeEmail),
      inviteeApprovedToAdd: addInviteeApproved(inviteeEmail, inviterDetails)
    });

    const notificationsToAdd = mergeObjectsWithArrValues(teamInvitesToAdd, inviteeApprovedToAdd);
    publishNotifications({notificationsToAdd, notificationsToClear: requestNewUserToClear});

    // keep this separate so we can include the mutatorId
    const notificationsCleared = {deletedIds: [dbNotificationId]};
    userIds.forEach((notifiedUserId) => {
      getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${notifiedUserId}`, {notificationsCleared, mutatorId: socket.id});
    });
    return {deletedId: dbNotificationId};
  }
};

