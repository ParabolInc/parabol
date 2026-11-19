import {GraphQLError} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {
  InvitationTokenError,
  LOCKED_MESSAGE,
  SubscriptionChannel
} from '../../../../client/types/constEnums'
import AuthToken from '../../../database/types/AuthToken'
import acceptTeamInvitationSafe from '../../../safeMutations/acceptTeamInvitation'
import {setAuthCookie} from '../../../utils/authCookie'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import RedisLock from '../../../utils/RedisLock'
import activatePrevSlackAuth from '../../mutations/helpers/activatePrevSlackAuth'
import handleInvitationToken from '../../mutations/helpers/handleInvitationToken'
import type {MutationResolvers} from '../resolverTypes'
import {getIsAnyUserOrgLocked} from './helpers/getIsAnyUserOrgLocked'
import {getIsUserIdApprovedByOrg} from './helpers/getIsUserIdApprovedByOrg'

const acceptTeamInvitation: MutationResolvers['acceptTeamInvitation'] = async (
  _source,
  {invitationToken, notificationId},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // VALIDATION
  const invitationRes = await handleInvitationToken(
    invitationToken,
    viewerId,
    dataLoader,
    notificationId ?? undefined
  )
  if (invitationRes.error) {
    const {error: tokenError, teamId, meetingId} = invitationRes
    if (tokenError === InvitationTokenError.ALREADY_ACCEPTED) {
      // a viewer still on the team gets the same answer as the first time
      if (teamId && isTeamMember(authToken, teamId)) {
        return {teamId, meetingId, teamMemberId: toTeamMemberId(teamId, viewerId)}
      }
      throw new GraphQLError('The invitation has already been accepted', {
        extensions: {code: 'CONFLICT'}
      })
    }
    if (tokenError === InvitationTokenError.EXPIRED) {
      throw new GraphQLError('The invitation has expired', {extensions: {code: 'CONFLICT'}})
    }
    throw new GraphQLError('The invitation is not valid', {extensions: {code: 'NOT_FOUND'}})
  }

  const {invitation} = invitationRes
  const {meetingId, teamId} = invitation
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {orgId} = team

  // make sure that same invite can't be accepted at the same moment
  const ttl = 3000
  const redisLock = new RedisLock(`acceptTeamInvitation:${viewerId}:${orgId}`, ttl)
  const lockTTL = await redisLock.checkLock()
  if (lockTTL > 0) {
    throw new GraphQLError('The invitation is already being accepted', {
      extensions: {code: 'CONFLICT'}
    })
  }

  const [approvalError, isAnyViewerOrgLocked] = await Promise.all([
    getIsUserIdApprovedByOrg(viewerId, orgId, dataLoader, invitationToken),
    getIsAnyUserOrgLocked(viewerId, dataLoader)
  ])
  if (approvalError) {
    await redisLock.unlock()
    throw approvalError
  }
  if (isAnyViewerOrgLocked) {
    await redisLock.unlock()
    throw new GraphQLError(LOCKED_MESSAGE.TEAM_INVITE, {extensions: {code: 'ORGANIZATION_LOCKED'}})
  }

  // RESOLUTION
  const {teamLeadUserIdWithNewActions, invitationNotificationIds} = await acceptTeamInvitationSafe(
    team,
    viewerId,
    dataLoader
  )
  activatePrevSlackAuth(viewerId, teamId, dataLoader)
  await redisLock.unlock()
  const tms = authToken.tms ? authToken.tms.concat(teamId) : [teamId]
  // IMPORTANT! mutate the current authToken so any queries or subscriptions can get the latest
  authToken.tms = tms
  const teamMemberId = toTeamMemberId(teamId, viewerId)

  const data = {
    meetingId,
    teamId,
    teamMemberId,
    invitationNotificationIds
  }

  const nextAuthToken = new AuthToken({
    tms,
    sub: viewerId,
    rol: authToken.rol,
    exp: authToken.exp,
    act: authToken.act,
    aud: authToken.aud,
    scope: authToken.scope
  })
  // This is to triage https://github.com/ParabolInc/parabol/issues/11167. We know it worked if we don't see it again
  context.authToken = nextAuthToken
  // if this gets called without a websocket (context.request), we need to set it: https://github.com/ParabolInc/parabol/issues/12610
  if (context.request) {
    setAuthCookie(context, nextAuthToken)
  }
  // Send the new team member a welcome & a new token
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {
    tms
  })
  // https://github.com/ParabolInc/parabol/issues/11167 We need to sleep a bit to let the new authToken propagate
  // To all of the viewer's subscribers (they may have 2 tabs open)

  // remove the old notifications
  if (invitationNotificationIds.length > 0) {
    publish(
      SubscriptionChannel.NOTIFICATION,
      viewerId,
      'AcceptTeamInvitationPayload',
      data,
      subOptions
    )
  }

  // Tell the rest of the team about the new team member
  publish(SubscriptionChannel.TEAM, teamId, 'AcceptTeamInvitationPayload', data, subOptions)

  // Send individualized message to the user
  publish(
    SubscriptionChannel.NOTIFICATION,
    viewerId,
    'AcceptTeamInvitationPayload',
    data,
    subOptions
  )

  // Give the team lead new suggested actions
  if (teamLeadUserIdWithNewActions) {
    // the team lead just needs data about themselves. alternatively we could make an eg AcceptTeamInvitationTeamLeadPayload, but nulls are just as good
    publish(
      SubscriptionChannel.NOTIFICATION,
      teamLeadUserIdWithNewActions,
      'AcceptTeamInvitationPayload',
      {...data, teamLeadId: teamLeadUserIdWithNewActions},
      subOptions
    )
  }
  return data
}

export default acceptTeamInvitation
