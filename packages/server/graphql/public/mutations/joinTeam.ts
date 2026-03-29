import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import acceptTeamInvitationSafe from '../../../safeMutations/acceptTeamInvitation'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMemberAsync} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const joinTeam: MutationResolvers['joinTeam'] = async (
  _source,
  {teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  if (!viewerId) {
    return standardError(new Error('You must be logged in to join a team'))
  }

  if (await isTeamMemberAsync(viewerId, teamId, dataLoader)) {
    return standardError(new Error('You are already a member of this team'))
  }

  const [team, viewer] = await Promise.all([
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  const {orgId} = team

  if (!team.isPublic) {
    return standardError(new Error('This team is not public'))
  }

  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({userId: viewerId, orgId})
  if (!organizationUser) {
    return standardError(new Error('Viewer does not belong to organization'))
  }

  await acceptTeamInvitationSafe(team, viewerId, dataLoader)

  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'TeamMembershipChangedPayload', {
    teamId,
    action: 'ADDED'
  })

  const teamMemberId = TeamMemberId.join(teamId, viewerId)

  const data = {
    teamId,
    teamMemberId
  }

  // Tell the rest of the team about the new team member
  publish(SubscriptionChannel.TEAM, teamId, 'JoinTeamSuccess', data, subOptions)

  analytics.joinedTeam(viewer, teamId)

  return {
    teamId,
    teamMemberId
  }
}

export default joinTeam
