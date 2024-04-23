import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import NotificationPromoteToBillingLeader from '../../../database/types/NotificationPromoteToBillingLeader'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const addNotifications = async (orgId: string, userId: string) => {
  const r = await getRethink()
  const promotionNotification = new NotificationPromoteToBillingLeader({orgId, userId})
  const {id: promotionNotificationId} = promotionNotification
  await r.table('Notification').insert(promotionNotification).run()
  return [promotionNotificationId]
}

const setOrgUserRole: MutationResolvers['setOrgUserRole'] = async (
  _source,
  {orgId, userId, role: roleToSet},
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

  if (roleToSet && roleToSet !== 'BILLING_LEADER' && roleToSet !== 'ORG_ADMIN') {
    return standardError(new Error('Invalid role to set'), {userId: viewerId})
  }

  const [organizationUser, viewer, viewerOrgUser] = await Promise.all([
    r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({orgId, removedAt: null})
      .nth(0)
      .default(null)
      .run(),
    dataLoader.get('users').loadNonNull(viewerId),
    r
      .table('OrganizationUser')
      .getAll(viewerId, {index: 'userId'})
      .filter({orgId, removedAt: null})
      .nth(0)
      .default(null)
      .run()
  ])

  if (!organizationUser) {
    return standardError(new Error('Cannot find org user'), {
      userId: viewerId
    })
  }

  if (
    roleToSet === 'ORG_ADMIN' || // promoting someone to ORG_ADMIN
    organizationUser.role === 'ORG_ADMIN' // the user is already an ORG_ADMIN so the mutation is intended to change their role
  ) {
    if (!isSuperUser(authToken) && viewerOrgUser?.role !== 'ORG_ADMIN') {
      return standardError(new Error('Only super user or org admin can perform this action'), {
        userId: viewerId
      })
    }
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
    if (leaderCount === 1 && !roleToSet) {
      return standardError(new Error('You’re the last leader, you can’t give that up'), {
        userId: viewerId
      })
    }
  }

  // no change required
  const {id: organizationUserId} = organizationUser
  if (organizationUser.role === roleToSet) {
    return {
      orgId,
      organizationUserId,
      notificationIdsAdded: []
    }
  }
  await r.table('OrganizationUser').get(organizationUserId).update({role: roleToSet}).run()

  if (roleToSet !== 'ORG_ADMIN') {
    const modificationType = roleToSet === 'BILLING_LEADER' ? 'add' : 'remove'
    analytics.billingLeaderModified(viewer, userId, orgId, modificationType)
  }

  // Don't add notification when promoting to org admin.
  const notificationIdsAdded =
    roleToSet === 'BILLING_LEADER' ? await addNotifications(orgId, userId) : []

  const data = {orgId, organizationUserId, notificationIdsAdded}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'SetOrgUserRoleSuccess', data, subOptions)
  return data
}

export default setOrgUserRole
