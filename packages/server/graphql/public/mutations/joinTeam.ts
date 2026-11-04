import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {teamJoins} from '../../../metricsHandler'
import acceptTeamInvitationSafe from '../../../safeMutations/acceptTeamInvitation'
import {getUserId, isTeamMember} from '../../../utils/authorization'
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

  if (isTeamMember(authToken, teamId)) {
    return standardError(new Error('You are already a member of this team'))
  }

  const team = await dataLoader.get('teams').loadNonNull(teamId)

  if (!team.isPublic) {
    return standardError(new Error('This team is not public'))
  }

  await acceptTeamInvitationSafe(team, viewerId, dataLoader)

  const tms = authToken.tms ? authToken.tms.concat(teamId) : [teamId]
  // IMPORTANT! mutate the current authToken so any queries or subscriptions can get the latest
  authToken.tms = tms
  const teamMemberId = TeamMemberId.join(teamId, viewerId)

  const data = {
    teamId,
    teamMemberId
  }

  // Send the new team member a welcome & a new token
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {
    tms
  })

  // Tell the rest of the team about the new team member
  publish(SubscriptionChannel.TEAM, teamId, 'JoinTeamSuccess', data, subOptions)

  teamJoins.inc({method: 'public_team'})

  return {
    teamId,
    teamMemberId
  }
}

export default joinTeam
