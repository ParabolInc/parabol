import {MutationResolvers} from '../resolverTypes'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import NotificationPromoteToBillingLeader from '../../../database/types/NotificationPromoteToBillingLeader'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {RDatum} from '../../../database/stricterR'

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

  if (role && role !== 'BILLING_LEADER' && role !== 'ORG_ADMIN') {
    return standardError(new Error('Invalid role'), {userId: viewerId})
  }

  const organizationUser = await r
    .table('OrganizationUser')
    .getAll(userId, {index: 'userId'})
    .filter({orgId, removedAt: null})
    .nth(0)
    .default(null)
    .run()

  if (!organizationUser) {
    return standardError(new Error('Cannot find org user'), {
      userId: viewerId
    })
  }

  if ((role === 'ORG_ADMIN' || organizationUser.role === 'ORG_ADMIN') && !isSuperUser(authToken)) {
    return standardError(new Error('Must be super user to promote/demote user to admin'), {
      userId: viewerId
    })
  }

  // if someone is leaving, make sure there is someone else to take their place
  if (userId === viewerId) {
    const leaderCount = await r
      .table('OrganizationUser')
      .getAll(orgId, {index: 'orgId'})
      .filter({removedAt: null})
      .filter((row: RDatum) => r.expr(['BILLING_LEADER', 'ORG_ADMIN']).contains(row('role')))
      .count()
      .run()
    if (leaderCount === 1) {
      return standardError(new Error('You’re the last leader, you can’t give that up'), {
        userId: viewerId
      })
    }
  }

  // no change required
  const {id: organizationUserId} = organizationUser
  if (organizationUser.role === role) {
    return {
      orgId,
      organizationUserId,
      notificationIdsAdded: []
    }
  }
  await r.table('OrganizationUser').get(organizationUserId).update({role}).run()

  if (role !== 'ORG_ADMIN') {
    const modificationType = role === 'BILLING_LEADER' ? 'add' : 'remove'
    analytics.billingLeaderModified(userId, viewerId, orgId, modificationType)
  }

  // Don't add notification when promoting to org admin.
  const notificationIdsAdded =
    role === 'BILLING_LEADER' ? await addNotifications(orgId, userId) : []

  const data = {orgId, organizationUserId, notificationIdsAdded}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'SetOrgUserRoleSuccess', data, subOptions)
  return data
}

export default setOrgUserRole
