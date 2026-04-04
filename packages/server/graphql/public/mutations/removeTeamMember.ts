import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import removeTeamMemberHelper from '../../mutations/helpers/removeTeamMember'
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

  if (!teamMember) return {error: {message: 'User is not on team'}}
  if (!teamMember.isNotRemoved) return {error: {message: 'User already removed from team'}}
  const isSelf = viewerId === userId

  // RESOLUTION
  const evictorUserId = isSelf ? undefined : viewerId
  const res = await removeTeamMemberHelper(teamMemberId, {evictorUserId}, dataLoader)
  const {user, notificationId, archivedTaskIds, reassignedTaskIds} = res
  if (!user) {
    return standardError(new Error('Could not remove given team member'), {userId})
  }
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const {tms} = user
  publish(SubscriptionChannel.NOTIFICATION, userId, 'AuthTokenPayload', {tms})
  const taskIds = [...archivedTaskIds, ...reassignedTaskIds]
  const data = {teamId, teamMemberId, taskIds, notificationId, userId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveTeamMemberPayload', data, subOptions)
  teamMembers.forEach(({userId: teamMemberUserId}) => {
    if (teamMemberUserId === userId) return
    publish(SubscriptionChannel.TASK, teamMemberUserId, 'RemoveTeamMemberPayload', data, subOptions)
  })
  publish(SubscriptionChannel.NOTIFICATION, userId, 'RemoveTeamMemberPayload', data, subOptions)
  return data
}

export default removeTeamMember
