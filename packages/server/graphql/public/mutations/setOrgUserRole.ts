import {MutationResolvers} from '../resolverTypes'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import NotificationPromoteToBillingLeader from '../../../database/types/NotificationPromoteToBillingLeader'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'

const addNotifications = async (orgId: string, userId: string) => {
  const r = await getRethink()
  const promotionNotification = new NotificationPromoteToBillingLeader({orgId, userId})
  const {id: promotionNotificationId} = promotionNotification
  await r.table('Notification').insert(promotionNotification).run()
  return [promotionNotificationId]
}

const setOrgUserRole: MutationResolvers['setOrgUserRole'] = async (
  _source,
  {orgId, userId, role},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const viewerId = getUserId(authToken)
  if (
    !(await isUserBillingLeader(viewerId, orgId, dataLoader, {clearCache: true})) &&
    !isSuperUser(authToken)
  ) {
    return standardError(new Error('Must be the organization leader or admin'), {
      userId: viewerId
    })
  }

  if (role && role !== 'BILLING_LEADER') {
    return standardError(new Error('Invalid role'), {userId: viewerId})
  }
  // if someone is leaving, make sure there is someone else to take their place
  if (userId === viewerId) {
    const leaderCount = await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null, role: 'BILLING_LEADER'})
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
  await r.table('OrganizationUser').get(organizationUserId).update({role}).run()

  const modificationType = role === 'BILLING_LEADER' ? 'add' : 'remove'
  analytics.billingLeaderModified(userId, viewerId, orgId, modificationType)

  const notificationIdsAdded =
    role === 'BILLING_LEADER' ? await addNotifications(orgId, userId) : []

  const data = {orgId, organizationUserId, notificationIdsAdded}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'SetOrgUserRoleSuccess', data, subOptions)
  return data
}

export default setOrgUserRole
