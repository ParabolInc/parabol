import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import SetOrgUserRolePayload from 'server/graphql/types/SetOrgUserRolePayload';
import {getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {errorObj} from 'server/utils/utils';
import shortid from 'shortid';
import {
  ADDED, BILLING_LEADER, billingLeaderTypes, ORGANIZATION, PROMOTE_TO_BILLING_LEADER, REMOVED,
  UPDATED
} from 'universal/utils/constants';

export default {
  type: SetOrgUserRolePayload,
  description: 'Set the role of a user',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The org to affect'
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the user who is receiving a role change'
    },
    role: {
      type: GraphQLString,
      description: 'the user’s new role'
    }
  },
  async resolve(source, {orgId, userId, role}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();
    const subOptions = {mutatorId, operationId};
    // AUTH
    const userOrgDoc = await getUserOrgDoc(authToken.sub, orgId);
    requireOrgLeader(userOrgDoc);

    // VALIDATION
    if (role && role !== BILLING_LEADER) {
      throw errorObj({_error: 'invalid role'});
    }
    // if someone is leaving, make sure there is someone else to take their place
    if (userId === authToken.sub) {
      const leaderCount = await r.table('Organization').get(orgId)('orgUsers')
        .filter({
          role: BILLING_LEADER
        })
        .count();
      if (leaderCount === 1) {
        throw new Error('You’re the last leader, you can’t give that up');
      }
    }

    // RESOLUTION
    const {organizationChanges} = await r({
      userOrgsUpdate: r.table('User').get(userId)
        .update((user) => ({
          userOrgs: user('userOrgs').map((userOrg) => {
            return r.branch(
              userOrg('id').eq(orgId),
              userOrg.merge({
                role
              }),
              userOrg
            );
          }),
          updatedAt: now
        })),
      organizationChanges: r.table('Organization').get(orgId)
        .update((org) => ({
          orgUsers: org('orgUsers').map((orgUser) => {
            return r.branch(
              orgUser('id').eq(userId),
              orgUser.merge({
                role
              }),
              orgUser
            );
          }),
          updatedAt: now
        }), {returnChanges: true})('changes')(0)
    });
    const {old_val: oldOrg, new_val: organization} = organizationChanges;
    const oldUser = oldOrg.orgUsers.find((orgUser) => orgUser.id === userId);
    const newUser = organization.orgUsers.find((orgUser) => orgUser.id === userId);
    if (oldUser.role === newUser.role) {
      return null;
    }
    if (role === BILLING_LEADER) {
      const promotionNotificationId = shortid.generate();
      const promotionNotification = {
        id: promotionNotificationId,
        type: PROMOTE_TO_BILLING_LEADER,
        startAt: now,
        orgId,
        userIds: [userId]
      };
      const {existingNotificationIds} = await r({
        insert: r.table('Notification').insert(promotionNotification),
        existingNotificationIds: r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
          .update((notification) => ({
            userIds: notification('userIds').append(userId)
          }), {returnChanges: true})('changes')('new_val')
          .default([])
      });
      const notificationIdsAdded = existingNotificationIds.concat(promotionNotificationId);
      // add the org to the list of owned orgs
      getPubSub().publish(`${ORGANIZATION}.${userId}`, {
        data: {
          type: ADDED,
          orgId,
          notificationIdsAdded
        },
        ...subOptions
      });

      getPubSub().publish(`${ORGANIZATION}.${orgId}`, {data: {type: UPDATED, orgId, userId}, ...subOptions});
      return {orgId, userId, notificationIdsAdded};
    }
    if (role === null) {
      const {oldPromotionId, removedNotificationIds} = await r({
        oldPromotionId: r.table('Notification')
          .getAll(userId, {index: 'userIds'})
          .filter({
            orgId,
            type: PROMOTE_TO_BILLING_LEADER
          })
          .delete({returnChanges: true})('changes')(0)('old_val')('id').default([]),
        removedNotificationIds: r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
          .update((notification) => ({
            userIds: notification('userIds').filter((id) => id.ne(userId))
          }), {returnChanges: true})('changes')('new_val')('id')
          .default([])
      });
      const notificationIdsRemoved = oldPromotionId.concat(removedNotificationIds);
      getPubSub().publish(`${ORGANIZATION}.${userId}`, {
        data: {
          type: REMOVED,
          orgId,
          notificationIdsRemoved
        },
        ...subOptions
      });

      getPubSub().publish(`${ORGANIZATION}.${orgId}`, {data: {type: UPDATED, orgId, userId}, ...subOptions});
      return {orgId, userId, notificationIdsRemoved};
    }
    return null;
  }
};
