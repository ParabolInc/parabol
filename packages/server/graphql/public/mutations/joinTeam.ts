// packages/server/graphql/public/mutations/joinTeam.ts
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import AuthToken from '../../../database/types/AuthToken'
import acceptTeamInvitationSafe from '../../../safeMutations/acceptTeamInvitation'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
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

  if (!viewerId) {
    return standardError(new Error('You must be logged in to join a team'))
  }

  if (isTeamMember(authToken, teamId)) {
    return standardError(new Error('You are already a member of this team'))
  }

  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {orgId} = team
  const viewer = await dataLoader.get('users').loadNonNull(viewerId)

  const hasPublicTeamsFlag = await dataLoader
    .get('featureFlagByOwnerId')
    .load({ownerId: orgId, featureName: 'publicTeams'})

  if (!hasPublicTeamsFlag) {
    return standardError(new Error('This team is not public'))
  }

  const approvalError = await getIsUserIdApprovedByOrg(viewerId, orgId, dataLoader)
  if (approvalError instanceof Error) {
    return standardError(approvalError)
  }

  const {invitationNotificationIds} = await acceptTeamInvitationSafe(team, viewerId, dataLoader)

  const tms = authToken.tms ? authToken.tms.concat(teamId) : [teamId]
  // IMPORTANT! mutate the current authToken so any queries or subscriptions can get the latest
  authToken.tms = tms
  const teamMemberId = `${teamId}::${viewerId}`

  const data = {
    teamId
  }
  console.log('🚀 ~ data:', data)

  const encodedAuthToken = encodeAuthToken(new AuthToken({tms, sub: viewerId, rol: authToken.rol}))

  // Send the new team member a welcome & a new token
  // publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {id: encodedAuthToken})
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})

  // Tell the rest of the team about the new team member
  publish(SubscriptionChannel.TEAM, teamId, 'JoinTeamSuccess', data, subOptions)

  return {
    team: {
      id: teamId
    },
    teamMemberId,
    authToken: encodedAuthToken
  }
}

export default joinTeam
