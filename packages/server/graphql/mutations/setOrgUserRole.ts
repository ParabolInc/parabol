import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {OrgUserRole} from 'parabol-client/types/graphql'
import getRethink from '../../database/rethinkDriver'
import NotificationPromoteToBillingLeader from '../../database/types/NotificationPromoteToBillingLeader'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import {sendSegmentIdentify} from '../../utils/sendSegmentEvent'
import standardError from '../../utils/standardError'
import SetOrgUserRolePayload from '../types/SetOrgUserRolePayload'

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
  async resolve(_source, {orgId, userId, role}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader, {clearCache: true}))) {
      return standardError(new Error('Must be the organization leader'), {userId: viewerId})
    }

    // VALIDATION
    if (role && role !== OrgUserRole.BILLING_LEADER) {
      return standardError(new Error('Invalid role'), {userId: viewerId})
    }
    // if someone is leaving, make sure there is someone else to take their place
    if (userId === viewerId) {
      const leaderCount = await r
        .table('OrganizationUser')
        .getAll(orgId, {index: 'orgId'})
        .filter({removedAt: null, role: OrgUserRole.BILLING_LEADER})
        .count()
        .run()
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
      .run()
    if (organizationUser.role === role) return null
    const {id: organizationUserId} = organizationUser
    // RESOLUTION
    await r
      .table('OrganizationUser')
      .get(organizationUserId)
      .update({role})
      .run()

    if (role === OrgUserRole.BILLING_LEADER) {
      const promotionNotification = new NotificationPromoteToBillingLeader({orgId, userId})
      const {id: promotionNotificationId} = promotionNotification
      await r
        .table('Notification')
        .insert(promotionNotification)
        .run()
      const notificationIdsAdded = [promotionNotificationId]
      // add the org to the list of owned orgs
      const data = {orgId, userId, organizationUserId, notificationIdsAdded}
      publish(
        SubscriptionChannel.ORGANIZATION,
        userId,
        'SetOrgUserRolePayload' as any,
        data,
        subOptions
      )
      publish(
        SubscriptionChannel.ORGANIZATION,
        orgId,
        'SetOrgUserRolePayload' as any,
        data,
        subOptions
      )
      await sendSegmentIdentify(userId)
      return data
    }
    if (role === null) {
      const data = {orgId, userId, organizationUserId}
      publish(
        SubscriptionChannel.ORGANIZATION,
        userId,
        'SetOrgUserRolePayload' as any,
        data,
        subOptions
      )
      publish(
        SubscriptionChannel.ORGANIZATION,
        orgId,
        'SetOrgUserRolePayload' as any,
        data,
        subOptions
      )
      await sendSegmentIdentify(userId)
      return data
    }
    return null
  }
}
