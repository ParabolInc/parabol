import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import removeTeamMemberHelper from '../../mutations/helpers/removeTeamMember'
import type {MutationResolvers} from '../resolverTypes'

const removeTeamMember: MutationResolvers['removeTeamMember'] = async (
  _source,
  {teamMemberId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const {userId, teamId} = fromTeamMemberId(teamMemberId)
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const [isOrgAdmin, teamMember] = await Promise.all([
    isUserOrgAdmin(viewerId, team.orgId, dataLoader),
    dataLoader.get('teamMembers').load(TeamMemberId.join(teamId, viewerId))
  ])
  const isViewerTeamLead = teamMember?.isNotRemoved && teamMember?.isLead
  const isSelf = viewerId === userId
  if (!isSelf) {
    if (!isOrgAdmin && !isViewerTeamLead) {
      return standardError(new Error('Not team lead or org admin'), {userId: viewerId})
    }
  }

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
