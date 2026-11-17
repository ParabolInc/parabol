import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {BATCH_ORG_USER_REMOVAL_LIMIT} from '../../../../client/utils/constants'
import {
  getUserId,
  isSuperUser,
  isUserBillingLeader,
  isUserOrgAdmin
} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import removeFromOrg from '../../mutations/helpers/removeFromOrg'
import type {MutationResolvers} from '../resolverTypes'

const removeOrgUsers: MutationResolvers['removeOrgUsers'] = async (
  _source,
  {userIds, orgId},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  const viewerId = getUserId(authToken)
  if (userIds.length === 0) {
    throw new GraphQLError('Empty userIds array is provided', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (userIds.length > BATCH_ORG_USER_REMOVAL_LIMIT) {
    throw new GraphQLError(
      `Cannot remove more than ${BATCH_ORG_USER_REMOVAL_LIMIT} org users at once`,
      {extensions: {code: 'BAD_USER_INPUT'}}
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
      throw new GraphQLError('Must be the organization leader to remove other users', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  }

  if (context.resourceGrants && !(await context.resourceGrants.hasOrg(orgId))) {
    throw new GraphQLError('PAT does not grant access to this organization', {
      extensions: {code: 'FORBIDDEN'}
    })
  }

  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) {
    throw new GraphQLError('Organization not found', {extensions: {code: 'NOT_FOUND'}})
  }

  const allOrgUsers = await dataLoader.get('organizationUsersByOrgId').load(orgId)
  const nonOrgUsers = userIds.filter(
    (userId) => !allOrgUsers.some((orgUser) => orgUser.userId === userId)
  )
  if (nonOrgUsers.length > 0) {
    throw new GraphQLError(
      `User(s) ${nonOrgUsers.join(', ')} are not members of the organization ${orgId}`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }

  const remainingOrgUsers = allOrgUsers.filter((orgUser) => !userIds.includes(orgUser.userId))
  if (remainingOrgUsers.length === 0) {
    throw new GraphQLError('Cannot remove all members from an org', {
      extensions: {code: 'CONFLICT'}
    })
  }
  if (
    !remainingOrgUsers.some(
      (orgUser) => orgUser.role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(orgUser.role)
    )
  ) {
    throw new GraphQLError('Cannot remove last billing leader', {extensions: {code: 'CONFLICT'}})
  }

  const {removedUsers, teamMemberIds, teamIds, taskIds, activeMeetingIds, kickOutNotificationIds} =
    await removeFromOrg([...new Set(userIds)], orgId, viewerId, dataLoader)

  const data = {
    removedUserIds: removedUsers.map(({userId}) => userId),
    removedOrgMemberIds: removedUsers.map(({organizationUserId}) => organizationUserId),
    removedTeamMemberIds: teamMemberIds,
    affectedOrganizationId: orgId,
    affectedOrganizationName: organization.name,
    affectedTeamIds: teamIds,
    affectedTaskIds: [...new Set(taskIds)],
    affectedMeetingIds: [...new Set(activeMeetingIds)],
    kickOutNotificationIds
  }

  removedUsers.forEach(({userId, tms}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'AuthTokenPayload', {tms})
  })

  publish(SubscriptionChannel.ORGANIZATION, orgId, 'RemoveOrgUsersSuccess', data, subOptions)

  data.affectedTeamIds.forEach((teamId) => {
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveOrgUsersSuccess', data, subOptions)
  })

  removedUsers.forEach(({userId}) => {
    publish(SubscriptionChannel.NOTIFICATION, userId, 'RemoveOrgUsersSuccess', data, subOptions)
  })

  data.removedTeamMemberIds.map(async (removedTeamMemberId) => {
    const teamMember = await dataLoader.get('teamMembers').load(removedTeamMemberId)
    if (!teamMember) return
    publish(SubscriptionChannel.TASK, teamMember.userId, 'RemoveOrgUsersSuccess', data, subOptions)
  })

  return data
}

export default removeOrgUsers
