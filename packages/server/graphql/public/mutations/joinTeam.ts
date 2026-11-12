import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import AuthToken from '../../../database/types/AuthToken'
import acceptTeamInvitationSafe from '../../../safeMutations/acceptTeamInvitation'
import {setAuthCookie} from '../../../utils/authCookie'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const joinTeam: MutationResolvers['joinTeam'] = async (_source, {teamId}, context) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
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
  const nextAuthToken = new AuthToken({
    tms,
    sub: viewerId,
    rol: authToken.rol,
    exp: authToken.exp,
    act: authToken.act,
    aud: authToken.aud,
    scope: authToken.scope
  })
  context.authToken = nextAuthToken
  if (context.request) {
    setAuthCookie(context, nextAuthToken)
  }
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

  return {
    teamId,
    teamMemberId
  }
}

export default joinTeam
