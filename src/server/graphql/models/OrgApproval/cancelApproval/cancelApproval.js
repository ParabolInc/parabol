import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireTeamMember, requireWebsocket} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATIONS_CLEARED, REQUEST_NEW_USER} from 'universal/utils/constants';

export default {
  type: GraphQLBoolean,
  description: 'Cancel a pending request for an invitee to join the org',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'org approval id to cancel'
    }
  },
  async resolve(source, {id}, {authToken, socket}) {
    const r = getRethink();

    // AUTH
    const orgApproval = await r.table('OrgApproval').get(id);
    const {email, orgId, teamId} = orgApproval;
    requireTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION
    const {removedNotification} = await r({
      removedApproval: r.table('OrgApproval')
        .get(id)
        .update({
          isActive: false
        }, {returnChanges: true})('changes')(0)('old_val')
        .default(null),
      removedNotification: r.table('Notification')
        .getAll(orgId, {index: 'orgId'})
        .filter({
          type: REQUEST_NEW_USER,
          teamId,
          inviteeEmail: email
        })
        .delete({returnChanges: true})('changes')(0)('old_val').pluck('id', 'userIds').default(null)
    });

    if (removedNotification) {
      const notificationsCleared = {deletedIds: [removedNotification.id]};
      removedNotification.userIds.forEach((userId) => {
        getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared});
      });
    }

    return true;
  }
};
