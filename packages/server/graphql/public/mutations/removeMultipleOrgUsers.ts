import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {BATCH_ORG_USER_REMOVAL_LIMIT} from '../../../postgres/constants'
import {
  getUserId,
  isSuperUser,
  isUserBillingLeader,
  isUserOrgAdmin
} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import removeFromOrg from '../../mutations/helpers/removeFromOrg'
import {MutationResolvers} from '../resolverTypes'
const removeMultipleOrgUsers: MutationResolvers['removeMultipleOrgUsers'] = async (
  _source,
  {userIds, orgId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  const viewerId = getUserId(authToken)
  if (userIds.length === 0) {
    return standardError(new Error('Empty userIds array is provided'), {
      userId: viewerId
    })
  }
  if (userIds.length > BATCH_ORG_USER_REMOVAL_LIMIT) {
    return standardError(
      new Error(`Cannot remove more than ${BATCH_ORG_USER_REMOVAL_LIMIT} org users at once`),
      {userId: getUserId(authToken)}
    )
  }

  // Validation
  if (userIds.includes(viewerId)) {
    return standardError(new Error('Cannot remove yourself'), {userId: viewerId})
  }
  if (
    !(await isUserBillingLeader(viewerId, orgId, dataLoader)) &&
    !(await isUserOrgAdmin(viewerId, orgId, dataLoader)) &&
    !isSuperUser(authToken)
  ) {
    return standardError(new Error('Must be the organization leader'), {userId: viewerId})
  }

  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    return standardError(new Error('Organization not found'), {userId: viewerId})
  }

  const orgUsers = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .loadMany(userIds.map((userId) => ({userId, orgId})))
  const nonOrgUsers = userIds.filter((_, idx) => !orgUsers[idx])
  if (nonOrgUsers.length > 0) {
    return standardError(
      new Error(`User(s) ${nonOrgUsers.join(', ')} are not members of the organization ${orgId}`),
      {userId: viewerId}
    )
  }

  const userResults = await Promise.all(
    userIds.map(async (userId: string) => {
      const userData = await removeFromOrg(userId, orgId, viewerId, dataLoader)
      return {userId, userData}
    })
  )

  const data = {
    orgId,
    taskIds: [...new Set(userResults.flatMap(({userData}) => userData.taskIds))],
    kickOutNotificationIds: [
      ...new Set(userResults.flatMap(({userData}) => userData.kickOutNotificationIds))
    ],
    teamIds: [...new Set(userResults.flatMap(({userData}) => userData.teamIds))],
    teamMemberIds: [...new Set(userResults.flatMap(({userData}) => userData.teamMemberIds))],
    userIds: [...new Set(userResults.map(({userId}) => userId))],
    organizationUserIds: [...new Set(userResults.map(({userData}) => userData.organizationUserId))]
  }

  publish(
    SubscriptionChannel.ORGANIZATION,
    orgId,
    'RemoveMultipleOrgUsersSuccess',
    data,
    subOptions
  )

  data.teamIds.forEach((teamId) => {
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveMultipleOrgUsersSuccess', data, subOptions)
  })

  userResults.map(async ({userId, userData}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'AuthTokenPayload', {tms: userData.tms})
    publish(
      SubscriptionChannel.NOTIFICATION,
      userId,
      'RemoveMultipleOrgUsersSuccess',
      data,
      subOptions
    )
  })

  data.teamMemberIds.map(async (teamMemberId) => {
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    if (!teamMember) return
    publish(
      SubscriptionChannel.TASK,
      teamMember.userId,
      'RemoveMultipleOrgUsersSuccess',
      data,
      subOptions
    )
  })

  return data
}

export default removeMultipleOrgUsers
