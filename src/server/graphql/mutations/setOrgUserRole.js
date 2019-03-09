import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import SetOrgUserRolePayload from 'server/graphql/types/SetOrgUserRolePayload'
import {getUserId, isUserBillingLeader} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {
  BILLING_LEADER,
  billingLeaderTypes,
  ORGANIZATION,
  PROMOTE_TO_BILLING_LEADER
} from 'universal/utils/constants'
import {sendSegmentIdentify} from 'server/utils/sendSegmentEvent'
import standardError from 'server/utils/standardError'

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
  async resolve (source, {orgId, userId, role}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader, {clearCache: true}))) {
      return standardError(new Error('Must be the organization leader'), {userId: viewerId})
    }

    // VALIDATION
    if (role && role !== BILLING_LEADER) {
      return standardError(new Error('Invalid role'), {userId: viewerId})
    }
    // if someone is leaving, make sure there is someone else to take their place
    if (userId === viewerId) {
      const leaderCount = await r
        .table('OrganizationUser')
        .getAll(orgId, {index: 'orgId'})
        .filter({removedAt: null, role: BILLING_LEADER})
        .count()
      if (leaderCount === 1) {
        return standardError(new Error('You’re the last leader, you can’t give that up'), {
          userId: viewerId
        })
      }
    }

    // no change required
    const organizationUser = await r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId, removedAt: null})
      .nth(0)
    if (organizationUser.role === role) return null
    const {id: organizationUserId} = organizationUser
    // RESOLUTION
    await r
      .table('OrganizationUser')
      .get(organizationUserId)
      .update({role})

    if (role === BILLING_LEADER) {
      const promotionNotificationId = shortid.generate()
      const promotionNotification = {
        id: promotionNotificationId,
        type: PROMOTE_TO_BILLING_LEADER,
        startAt: now,
        orgId,
        userIds: [userId]
      }
      const {existingNotificationIds} = await r({
        insert: r.table('Notification').insert(promotionNotification),
        existingNotificationIds: r
          .table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
          .update(
            (notification) => ({
              userIds: notification('userIds').append(userId)
            }),
            {returnChanges: true}
          )('changes')('new_val')
          .default([])
      })
      const notificationIdsAdded = existingNotificationIds.concat(promotionNotificationId)
      // add the org to the list of owned orgs
      const data = {orgId, userId, organizationUserId, notificationIdsAdded}
      publish(ORGANIZATION, userId, SetOrgUserRolePayload, data, subOptions)
      publish(ORGANIZATION, orgId, SetOrgUserRolePayload, data, subOptions)
      await sendSegmentIdentify(userId)
      return data
    }
    if (role === null) {
      const {oldPromotion, removedNotifications} = await r({
        oldPromotion: r
          .table('Notification')
          .getAll(userId, {index: 'userIds'})
          .filter({
            orgId,
            type: PROMOTE_TO_BILLING_LEADER
          })
          .delete({returnChanges: true})('changes')(0)('old_val')
          .default([]),
        removedNotifications: r
          .table('Notification')
          .getAll(orgId, {index: 'orgId'})
          .filter((notification) => r.expr(billingLeaderTypes).contains(notification('type')))
          .update(
            (notification) => ({
              userIds: notification('userIds').filter((id) => id.ne(userId))
            }),
            {returnChanges: true}
          )('changes')('new_val')
          .default([])
      })
      const notificationsRemoved = removedNotifications.concat(oldPromotion)
      const data = {orgId, userId, organizationUserId, notificationsRemoved}
      publish(ORGANIZATION, userId, SetOrgUserRolePayload, data, subOptions)
      publish(ORGANIZATION, orgId, SetOrgUserRolePayload, data, subOptions)
      await sendSegmentIdentify(userId)
      return data
    }
    return null
  }
}
