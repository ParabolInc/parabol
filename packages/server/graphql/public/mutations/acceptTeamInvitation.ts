import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {
  InvitationTokenError,
  LOCKED_MESSAGE,
  SubscriptionChannel
} from '../../../../client/types/constEnums'
import AuthToken from '../../../database/types/AuthToken'
import acceptTeamInvitationSafe from '../../../safeMutations/acceptTeamInvitation'
import RedisLock from '../../../utils/RedisLock'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import publish from '../../../utils/publish'
import activatePrevSlackAuth from '../../mutations/helpers/activatePrevSlackAuth'
import handleInvitationToken from '../../mutations/helpers/handleInvitationToken'
import {MutationResolvers} from '../resolverTypes'
import getIsAnyViewerTeamLocked from './helpers/getIsAnyViewerTeamLocked'
import getIsUserIdApprovedByOrg from './helpers/getIsUserIdApprovedByOrg'

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
  // This can happen if login with an invitation failed. We want to handle this gracefully so the client shows a nice error message
  if (!viewerId) {
    return {error: {message: InvitationTokenError.NOT_SIGNED_IN}}
  }

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  const invitationRes = await handleInvitationToken(
    invitationToken,
    viewerId,
    dataLoader,
    notificationId ?? undefined
  )
  if (invitationRes.error) {
    const {error: message, teamId, meetingId} = invitationRes
    // If the user already accepted the invite, then we want to send the needed data together with the error, unless they were removed in the meantime
    if (
      message === InvitationTokenError.ALREADY_ACCEPTED &&
      teamId &&
      isTeamMember(authToken, teamId)
    ) {
      return {error: {message}, teamId, meetingId, teamMemberId: toTeamMemberId(teamId!, viewerId)}
    }
    return {error: {message}}
  }

  const {invitation} = invitationRes
  const {meetingId, teamId, invitedBy: inviterId} = invitation
  const acceptAt = invitation.meetingId ? 'meeting' : 'team'
  const [team, inviter] = await Promise.all([
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('users').loadNonNull(inviterId)
  ])
  const {orgId} = team

  // make sure that same invite can't be accepted at the same moment
  const ttl = 3000
  const redisLock = new RedisLock(`acceptTeamInvitation:${viewerId}:${orgId}`, ttl)
  const lockTTL = await redisLock.checkLock()
  if (lockTTL > 0) {
    return {
      error: {message: `You already called this ${ttl - lockTTL}ms ago!`}
    }
  }

  const [approvalError, isAnyViewerTeamLocked] = await Promise.all([
    getIsUserIdApprovedByOrg(viewerId, orgId, dataLoader, invitationToken),
    getIsAnyViewerTeamLocked(viewer.tms, dataLoader)
  ])
  if (approvalError instanceof Error) {
    await redisLock.unlock()
    return {error: {message: approvalError.message}}
  }
  if (isAnyViewerTeamLocked) {
    analytics.lockedUserAttemptToJoinTeam(viewer, orgId)
    return {
      error: {
        message: LOCKED_MESSAGE.TEAM_INVITE
      }
    }
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

  const nextAuthToken = new AuthToken({tms, sub: viewerId, rol: authToken.rol})
  // This is to triage https://github.com/ParabolInc/parabol/issues/11167. We know it worked if we don't see it again
  context.authToken = nextAuthToken

  // Send the new team member a welcome & a new token
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})
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
  const isNewUser = viewer.createdAt.getDate() === viewer.lastSeenAt.getDate()
  analytics.inviteAccepted(viewer, inviter, teamId, isNewUser, acceptAt)
  return {
    ...data,
    authToken: encodeAuthToken(nextAuthToken)
  }
}

export default acceptTeamInvitation
