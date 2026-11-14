import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import removeTeamMembers from '../../mutations/helpers/removeTeamMembers'
import type {MutationResolvers} from '../resolverTypes'

const removeTeamMember: MutationResolvers['removeTeamMember'] = async (
  _source,
  {teamId, userId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const teamMemberId = TeamMemberId.join(teamId, userId)

  const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)

  if (!teamMember) throw new GraphQLError('User is not on team', {extensions: {code: 'FORBIDDEN'}})
  if (!teamMember.isNotRemoved)
    throw new GraphQLError('User already removed from team', {extensions: {code: 'CONFLICT'}})
  const isSelf = viewerId === userId

  // RESOLUTION
  const evictorUserId = isSelf ? undefined : viewerId
  const {removedUserIds, notificationIds, archivedTaskIds, reassignedTaskIds} =
    await removeTeamMembers(teamId, [userId], {evictorUserId}, dataLoader)
  if (removedUserIds.length === 0) {
    throw new GraphQLError('Could not remove given team member', {
      extensions: {code: 'INTERNAL_SERVER_ERROR'}
    })
  }
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const tms = await dataLoader.get('teamIdsByUserId').load(userId)
  publish(SubscriptionChannel.NOTIFICATION, userId, 'AuthTokenPayload', {tms})
  const taskIds = [...archivedTaskIds, ...reassignedTaskIds]
  const data = {teamId, teamMemberId, taskIds, notificationId: notificationIds[0], userId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveTeamMemberPayload', data, subOptions)
  teamMembers.forEach(({userId: teamMemberUserId}) => {
    if (teamMemberUserId === userId) return
    publish(SubscriptionChannel.TASK, teamMemberUserId, 'RemoveTeamMemberPayload', data, subOptions)
  })
  publish(SubscriptionChannel.NOTIFICATION, userId, 'RemoveTeamMemberPayload', data, subOptions)
  return data
}

export default removeTeamMember
