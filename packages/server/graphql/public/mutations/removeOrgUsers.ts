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
const removeOrgUsers: MutationResolvers['removeOrgUsers'] = async (
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
  const otherUserIds = userIds.filter((userId) => userId !== viewerId)
  if (otherUserIds.length > 0) {
    if (
      !(await isUserBillingLeader(viewerId, orgId, dataLoader)) &&
      !(await isUserOrgAdmin(viewerId, orgId, dataLoader)) &&
      !isSuperUser(authToken)
    ) {
      return standardError(new Error('Must be the organization leader to remove other users'), {
        userId: viewerId
      })
    }
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

  const removedUserResults = await Promise.all(
    userIds.map(async (removedUserId: string) => {
      const removedUserData = await removeFromOrg(removedUserId, orgId, viewerId, dataLoader)
      return {removedUserId, removedUserData}
    })
  )

  const data = {
    removedUserIds: [...new Set(removedUserResults.map(({removedUserId}) => removedUserId))],
    removedOrgMemberIds: [
      ...new Set(removedUserResults.map(({removedUserData}) => removedUserData.organizationUserId))
    ],
    removedTeamMemberIds: [
      ...new Set(removedUserResults.flatMap(({removedUserData}) => removedUserData.teamMemberIds))
    ],
    affectedOrganizationId: orgId,
    affectedOrganizationName: organization.name,
    affectedTeamIds: [
      ...new Set(removedUserResults.flatMap(({removedUserData}) => removedUserData.teamIds))
    ],
    affectedTaskIds: [
      ...new Set(removedUserResults.flatMap(({removedUserData}) => removedUserData.taskIds))
    ],
    affectedMeetingIds: [
      ...new Set(
        removedUserResults.flatMap(({removedUserData}) => removedUserData.activeMeetingIds)
      )
    ],
    kickOutNotificationIds: [
      ...new Set(
        removedUserResults.flatMap(({removedUserData}) => removedUserData.kickOutNotificationIds)
      )
    ]
  }

  removedUserResults.map(async ({removedUserId, removedUserData}) => {
    publish(SubscriptionChannel.NOTIFICATION, removedUserId, 'AuthTokenPayload', {
      tms: removedUserData.tms
    })
  })

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'RemoveOrgUsersSuccess', data, subOptions)

  data.affectedTeamIds.forEach((teamId) => {
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveOrgUsersSuccess', data, subOptions)
  })

  removedUserResults.map(async ({removedUserId}) => {
    publish(
      SubscriptionChannel.NOTIFICATION,
      removedUserId,
      'RemoveOrgUsersSuccess',
      data,
      subOptions
    )
  })

  data.removedTeamMemberIds.map(async (removedTeamMemberId) => {
    const teamMember = await dataLoader.get('teamMembers').load(removedTeamMemberId)
    if (!teamMember) return
    publish(SubscriptionChannel.TASK, teamMember.userId, 'RemoveOrgUsersSuccess', data, subOptions)
  })

  return data
}

export default removeOrgUsers
