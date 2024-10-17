import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const addNotifications = async (orgId: string, userId: string) => {
  const pg = getKysely()
  const promotionNotificationId = generateUID()
  await pg
    .insertInto('Notification')
    .values({
      id: promotionNotificationId,
      type: 'PROMOTE_TO_BILLING_LEADER',
      orgId,
      userId
    })
    .execute()
  return [promotionNotificationId]
}

const setOrgUserRole: MutationResolvers['setOrgUserRole'] = async (
  _source,
  {orgId, userId, role: roleToSet},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
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

  const [orgUsers, viewer] = await Promise.all([
    dataLoader.get('organizationUsersByOrgId').load(orgId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  const organizationUser = orgUsers.find((orgUser) => orgUser.userId === userId)
  const viewerOrgUser = orgUsers.find((orgUser) => orgUser.userId === viewerId)
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

  // if removing a role, make sure someone else has elevated permissions
  if (!roleToSet) {
    const leaders = orgUsers.filter(
      ({role}) => role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(role)
    )
    const leaderCount = leaders.length
    if (leaderCount === 1) {
      return standardError(new Error('Cannot remove permissions of the last leader'), {
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
  await pg
    .updateTable('OrganizationUser')
    .set({role: roleToSet || null})
    .where('id', '=', organizationUserId)
    .execute()
  organizationUser.role = roleToSet || null
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
