import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import NotificationsClearedPayload from 'server/graphql/types/NotificationsClearedPayload';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATIONS_CLEARED, TEAM_INVITE} from 'universal/utils/constants';


export default {
  name: 'CancelTeamInvite',
  type: NotificationsClearedPayload,
  description: 'Cancel an invitation',
  args: {
    inviteId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the invitation'
    }
  },
  async resolve(source, {inviteId}, {authToken, socket}) {
    const r = getRethink();
    const now = new Date();

    // AUTH
    const invitation = await r.table('Invitation').get(inviteId).default(null);
    const {email, teamId} = invitation;
    if (!teamId) {
      throw new Error('Invitation not found!');
    }
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);


    // RESOLUTION
    const {notificationsToClear} = await r({
      invitation: r.table('Invitation').get(inviteId).update({
        // set expiration to epoch
        tokenExpiration: new Date(0),
        updatedAt: now
      }),
      orgApproval: r.table('OrgApproval')
        .getAll(email, {index: 'email'})
        .filter({teamId})
        .update({
          isActive: false
        }),
      notificationsToClear: r.table('User')
        .getAll(email, {index: 'email'})
        .nth(0)('id').default(null)
        .do((userId) => {
          return r({
            deletedIds: r.table('Notification')
              .getAll(userId, {index: 'userIds'})
              .filter({
                type: TEAM_INVITE,
                teamId
              })
              .delete({returnChanges: true})('changes')('old_val')('id')
              .default([]),
            userId
          });
        })
    });
    const {userId, deletedIds} = notificationsToClear;
    const notificationsCleared = {deletedIds};
    if (deletedIds.length > 0) {
      getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared, mutatorId: socket.id});
    }
    return {deletedIds};
  }
};
