import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import {requireSUOrTeamMember, requireWebsocket} from 'server/utils/authorization';
import {NOTIFICATIONS_CLEARED, REQUEST_NEW_USER} from 'universal/utils/constants';
import getPubSub from 'server/utils/getPubSub';

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
    requireSUOrTeamMember(authToken, teamId);
    requireWebsocket(socket);

    // RESOLUTION
    const removedNotification = await r.table('OrgApproval')
      .get(id)
      .delete({returnChanges: true})('changes')(0)('old_val')
      .default(null)
      .do((removedApproval) => {
        // removal notifications concerning the approval
        return r.branch(
          removedApproval,
          r.table('Notification')
            .getAll(orgId, {index: 'orgId'})
            .filter({
              type: REQUEST_NEW_USER,
              teamId: removedApproval('teamId')
            })
            .filter((notification) => {
              return r.and(notification('inviteeEmail').eq(email), notification('teamId').eq(teamId));
            })
            .delete({returnChanges: true})('changes')(0)('old_val').pluck('id', 'userIds').default(null),
          null
        );
      });
    if (removedNotification) {
      const notificationsCleared = {deletedIds: [removedNotification.id]};
      removedNotification.userIds.forEach((userId) => {
        getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared})
      })
    }

    return true;
  }
};
