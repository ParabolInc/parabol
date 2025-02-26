// packages/server/graphql/public/mutations/joinTeam.ts
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import AuthToken from '../../../database/types/AuthToken'
import acceptTeamInvitationSafe from '../../../safeMutations/acceptTeamInvitation'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'
import getIsUserIdApprovedByOrg from './helpers/getIsUserIdApprovedByOrg'

const joinTeam: MutationResolvers['joinTeam'] = async (
  _source,
  {teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // VALIDATION
  if (!viewerId) {
    return {error: {message: 'You must be logged in to join a team'}}
  }

  // Check if user is already on the team
  if (isTeamMember(authToken, teamId)) {
    return {error: {message: 'You are already a member of this team'}}
  }

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {orgId} = team

  // Check if the organization has public teams enabled
  const hasPublicTeamsFlag = await dataLoader
    .get('featureFlagByOwnerId')
    .load({ownerId: orgId, featureName: 'publicTeams'})

  if (!hasPublicTeamsFlag) {
    return {error: {message: 'This team is not public'}}
  }

  // Check if user is approved by the organization
  const approvalError = await getIsUserIdApprovedByOrg(viewerId, orgId, dataLoader)
  if (approvalError instanceof Error) {
    return {error: {message: approvalError.message}}
  }

  // RESOLUTION
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const {teamLeadUserIdWithNewActions, invitationNotificationIds} = await acceptTeamInvitationSafe(
    team,
    viewerId,
    dataLoader
  )

  const tms = authToken.tms ? authToken.tms.concat(teamId) : [teamId]
  // IMPORTANT! mutate the current authToken so any queries or subscriptions can get the latest
  authToken.tms = tms
  const teamMemberId = `${teamId}::${viewerId}`

  const data = {
    teamId,
    teamMemberId,
    invitationNotificationIds
  }

  const encodedAuthToken = encodeAuthToken(new AuthToken({tms, sub: viewerId, rol: authToken.rol}))

  // Send the new team member a welcome & a new token
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})

  // Tell the rest of the team about the new team member
  publish(SubscriptionChannel.TEAM, teamId, 'JoinTeamPayload', data, subOptions)

  // Send individualized message to the user
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'JoinTeamPayload', data, subOptions)

  // Give the team lead new suggested actions
  if (teamLeadUserIdWithNewActions) {
    publish(
      SubscriptionChannel.NOTIFICATION,
      teamLeadUserIdWithNewActions,
      'JoinTeamPayload',
      {...data, teamLeadId: teamLeadUserIdWithNewActions},
      subOptions
    )
  }

  // analytics.teamJoined(viewer, teamId)

  return {
    teamId,
    teamMemberId,
    authToken: encodedAuthToken
  }
}

export default joinTeam
