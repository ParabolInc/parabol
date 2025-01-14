import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {BATCH_ORG_USER_REMOVAL_LIMIT} from '../../../postgres/constants'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import removeFromOrg from '../../mutations/helpers/removeFromOrg'
import {MutationResolvers} from '../resolverTypes'
const removeMultipleOrgUsers: MutationResolvers['removeMultipleOrgUsers'] = async (
  _source,
  {userIds, orgId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  if (userIds.length === 0) {
    return standardError(new Error('Empty userIds array is provided'), {
      userId: getUserId(authToken)
    })
  }
  if (userIds.length > BATCH_ORG_USER_REMOVAL_LIMIT) {
    return standardError(
      new Error(`Cannot remove more than ${BATCH_ORG_USER_REMOVAL_LIMIT} org users at once`),
      {userId: getUserId(authToken)}
    )
  }

  // Validation
  const viewerId = getUserId(authToken)
  if (userIds.includes(viewerId)) {
    return standardError(new Error('Cannot remove yourself'), {userId: viewerId})
  }
  if (!(await isUserBillingLeader(viewerId, orgId, dataLoader)) && !isSuperUser(authToken)) {
    return standardError(new Error('Must be the organization leader'), {userId: viewerId})
  }

  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    return standardError(new Error('Organization not found'), {userId: viewerId})
  }

  const orgUserPromises = userIds.map((userId) =>
    dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId})
  )
  const orgUsers = await Promise.all(orgUserPromises)
  const nonOrgUsers = userIds.filter((_, idx) => !orgUsers[idx])
  if (nonOrgUsers.length > 0) {
    return standardError(
      new Error(`User(s) ${nonOrgUsers.join(', ')} are not members of the organization ${orgId}`),
      {userId: viewerId}
    )
  }

  const data = {
    orgId,
    teamIds: [] as string[],
    teamMemberIds: [] as string[],
    taskIds: [] as string[],
    userIds: [] as string[],
    kickOutNotificationIds: [] as string[],
    organizationUserIds: [] as string[]
  }
  // Process each user removal
  await Promise.all(
    userIds.map(async (userId: string) => {
      const {tms, taskIds, kickOutNotificationIds, teamIds, teamMemberIds, organizationUserId} =
        await removeFromOrg(userId, orgId, viewerId, dataLoader)
      publish(SubscriptionChannel.NOTIFICATION, userId, 'AuthTokenPayload', {tms})

      data.taskIds.push(...taskIds)
      data.kickOutNotificationIds.push(...kickOutNotificationIds)
      data.teamIds.push(...teamIds)
      data.teamMemberIds.push(...teamMemberIds)
      data.userIds.push(userId)
      data.organizationUserIds.push(organizationUserId)

      publish(SubscriptionChannel.ORGANIZATION, orgId, 'RemoveOrgUserPayload', data, subOptions)
      publish(SubscriptionChannel.NOTIFICATION, userId, 'RemoveOrgUserPayload', data, subOptions)
      teamIds.forEach((teamId) => {
        const teamData = {...data, teamFilterId: teamId}
        publish(SubscriptionChannel.TEAM, teamId, 'RemoveOrgUserPayload', teamData, subOptions)
      })

      const remainingTeamMembers = (await dataLoader.get('teamMembersByTeamId').loadMany(teamIds))
        .filter(isValid)
        .flat()
      remainingTeamMembers.forEach((teamMember) => {
        if (teamMemberIds.includes(teamMember.id)) return
        publish(
          SubscriptionChannel.TASK,
          teamMember.userId,
          'RemoveOrgUserPayload',
          data,
          subOptions
        )
      })
    })
  )

  return data
}

export default removeMultipleOrgUsers
