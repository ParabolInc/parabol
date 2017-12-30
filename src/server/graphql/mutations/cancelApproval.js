import {GraphQLID, GraphQLNonNull} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import CancelApprovalPayload from 'server/graphql/types/CancelApprovalPayload';
import {requireTeamMember} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {NOTIFICATIONS_CLEARED, ORG_APPROVAL, REMOVED, REQUEST_NEW_USER} from 'universal/utils/constants';

export default {
  type: CancelApprovalPayload,
  description: 'Cancel a pending request for an invitee to join the org',
  args: {
    orgApprovalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'org approval id to cancel'
    }
  },
  async resolve(source, {orgApprovalId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const operationId = dataLoader.share();

    // AUTH
    const orgApprovalDoc = await r.table('OrgApproval').get(orgApprovalId);
    const {email, orgId, teamId} = orgApprovalDoc;
    requireTeamMember(authToken, teamId);

    // RESOLUTION
    const {orgApproval, removedNotification} = await r({
      orgApproval: r.table('OrgApproval')
        .get(orgApprovalId)
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

    getPubSub().publish(`${ORG_APPROVAL}.${teamId}`, {data: {orgApproval, type: REMOVED}, mutatorId, operationId});
    return {orgApproval};
  }
};
