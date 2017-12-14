import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import UpdateOrgPayload from 'server/graphql/types/UpdateOrgPayload';
import {getUserOrgDoc, requireOrgLeader} from 'server/utils/authorization';
import getPubSub from 'server/utils/getPubSub';
import {errorObj} from 'server/utils/utils';
import shortid from 'shortid';
import {
  BILLING_LEADER,
  billingLeaderTypes,
  NOTIFICATIONS_ADDED,
  NOTIFICATIONS_CLEARED,
  ORGANIZATION_ADDED,
  ORGANIZATION_UPDATED,
  PROMOTE_TO_BILLING_LEADER
} from 'universal/utils/constants';

export default {
  type: UpdateOrgPayload,
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
  async resolve(source, {orgId, userId, role}, {authToken, dataLoader, socketId}) {
    const r = getRethink();
    const now = new Date();
    const operationId = dataLoader.share();

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
      // add a notification
      const promotionNotification = {
        id: shortid.generate(),
        type: PROMOTE_TO_BILLING_LEADER,
        startAt: now,
        orgId,
        userIds: [userId],
        groupName: organization.name
      };
      const {existingNotifications} = await r({
        insert: r.table('Notification').insert(promotionNotification),
        existingNotifications: r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
          .update((notification) => ({
            userIds: notification('userIds').append(userId)
          }), {returnChanges: true})('changes')('new_val')
          .default([])
      });
      const notificationsAdded = {notifications: existingNotifications.concat(promotionNotification)};
      getPubSub().publish(`${NOTIFICATIONS_ADDED}.${userId}`, {notificationsAdded, operationId});

      // add the org to the list of owned orgs
      const organizationAdded = {organization};
      getPubSub().publish(`${ORGANIZATION_ADDED}.${userId}`, {organizationAdded, operationId, mutatorId: socketId});
    } else if (role === null) {
      const {oldPromotionId, removedNotificationIds} = await r({
        oldPromotionId: r.table('Notification')
          .getAll(userId, {index: 'userIds'})
          .filter({
            orgId,
            type: PROMOTE_TO_BILLING_LEADER
          })
          .delete({returnChanges: true})('changes')(0)('old_val')('id').default(null),
        removedNotificationIds: r.table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
          .update((notification) => ({
            userIds: notification('userIds').filter((id) => id.ne(userId))
          }), {returnChanges: true})('changes')('new_val')('id')
          .default([])
      });
      const deletedIds = oldPromotionId ? removedNotificationIds.concat(oldPromotionId) : removedNotificationIds;
      if (deletedIds.length > 0) {
        const notificationsCleared = {deletedIds};
        getPubSub().publish(`${NOTIFICATIONS_CLEARED}.${userId}`, {notificationsCleared, operationId});
      }
    }

    // Update all billing leaders online
    const organizationUpdated = {updatedOrgUser: newUser, organization};
    getPubSub().publish(`${ORGANIZATION_UPDATED}.${orgId}`, {organizationUpdated, operationId, mutatorId: socketId});

    return organizationUpdated;
  }
};
