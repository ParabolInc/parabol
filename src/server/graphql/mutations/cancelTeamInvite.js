import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import CancelTeamInvitePayload from 'server/graphql/types/CancelTeamInvitePayload';
import {requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {INVITATION_REMOVED, NOTIFICATIONS_CLEARED, TEAM_INVITE} from 'universal/utils/constants';


export default {
  name: 'CancelTeamInvite',
  type: CancelTeamInvitePayload,
  description: 'Cancel an invitation',
  args: {
    inviteId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the invitation'
    }
  },
  async resolve(source, {inviteId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();

    // AUTH
    const {email, teamId} = await r.table('Invitation').get(inviteId).default({});
    if (!teamId) {
      throw new Error('Invitation not found!');
    }
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const {invitation, notificationToClear} = await r({
      invitation: r.table('Invitation').get(inviteId).update({
        // set expiration to epoch
        tokenExpiration: new Date(0),
        updatedAt: now
      }, {returnChanges: true})('changes')(0)('new_val').default(null),
      orgApproval: r.table('OrgApproval')
        .getAll(email, {index: 'email'})
        .filter({teamId})
        .update({
          isActive: false
        }),
      notificationToClear: r.table('User')
        .getAll(email, {index: 'email'})
        .nth(0)('id').default(null)
        .do((userId) => {
          return r({
            deletedId: r.table('Notification')
              .getAll(userId, {index: 'userIds'})
              .filter({
                type: TEAM_INVITE,
                teamId
              })
              .delete({returnChanges: true})('changes')(0)('old_val')('id')
              .default(null),
            userId
          });
        })
    });
    if (invitation) {
      const invitationRemoved = {invitation};
      getPubSub().publish(`${INVITATION_REMOVED}.${teamId}`, {invitationRemoved, operationId, mutatorId});
    }
    const {userId, deletedId} = notificationToClear;
    if (deletedId) {
      const notificationsCleared = {deletedId: [deletedId]};
      getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared, mutatorId});
    }

    return {
      invitation,
      deletedNotificationId: deletedId
    };
  }
};
