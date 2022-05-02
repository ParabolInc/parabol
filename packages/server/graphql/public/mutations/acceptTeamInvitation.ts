import plural from 'parabol-client/utils/plural'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {InvitationTokenError, SubscriptionChannel} from '../../../../client/types/constEnums'
import AuthToken from '../../../database/types/AuthToken'
import acceptTeamInvitationSafe from '../../../safeMutations/acceptTeamInvitation'
import {getUserId} from '../../../utils/authorization'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import publish from '../../../utils/publish'
import RedisLock from '../../../utils/RedisLock'
import segmentIo from '../../../utils/segmentIo'
import activatePrevSlackAuth from '../../mutations/helpers/activatePrevSlackAuth'
import handleInvitationToken from '../../mutations/helpers/handleInvitationToken'
import {MutationResolvers} from '../resolverTypes'

const acceptTeamInvitation: MutationResolvers['acceptTeamInvitation'] = async (
  _source,
  {invitationToken, notificationId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // VALIDATION
  const invitationRes = await handleInvitationToken(
    invitationToken,
    viewerId,
    dataLoader,
    notificationId
  )
  if (invitationRes.error) {
    const {error: message, teamId, meetingId} = invitationRes
    if (message === InvitationTokenError.ALREADY_ACCEPTED) {
      return {error: {message}, teamId, meetingId}
    }
    return {error: {message}}
  }

  const {invitation} = invitationRes
  const {meetingId, teamId, email: inviteeEmail} = invitation
  const meeting = meetingId ? await dataLoader.get('newMeetings').load(meetingId) : null
  const activeMeetingId = meeting && !meeting.endedAt ? meetingId : null
  const team = await dataLoader.get('teams').loadNonNull(teamId)
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

  const organizationUser = await dataLoader
    .get('organizationUsersByUserIdOrgId')
    .load({userId: viewerId, orgId})
  if (!organizationUser) {
    // make sure the email is allowed on the org
    const approvedDomains = await dataLoader.get('organizationApprovedDomains').load(orgId)
    if (approvedDomains.length > 0) {
      const viewer = await dataLoader.get('users').load(viewerId)
      const {email, identities} = viewer
      const isApproved = approvedDomains.some((domain) => email.endsWith(domain))
      if (!isApproved) {
        const message = `Must sign in from the following ${plural(
          approvedDomains.length,
          'domain'
        )}: ${approvedDomains.join(', ')}}`
        return {error: {message}}
      }
      const isEmailUnverified = identities.some((identity) => !identity.isEmailVerified)
      if (isEmailUnverified) {
        return {error: {message: 'You must verify your email to join. Check your email'}}
      }
      // make sure their email is verified
    }
  }

  // RESOLUTION
  const {teamLeadUserIdWithNewActions, invitationNotificationIds} = await acceptTeamInvitationSafe(
    team,
    viewerId,
    dataLoader
  )
  activatePrevSlackAuth(viewerId, teamId)
  await redisLock.unlock()
  const tms = authToken.tms ? authToken.tms.concat(teamId) : [teamId]
  // IMPORTANT! mutate the current authToken so any queries or subscriptions can get the latest
  authToken.tms = tms
  const teamMemberId = toTeamMemberId(teamId, viewerId)

  const data = {
    meetingId: activeMeetingId,
    teamId,
    teamMemberId,
    invitationNotificationIds
  }

  const encodedAuthToken = encodeAuthToken(new AuthToken({tms, sub: viewerId, rol: authToken.rol}))

  // Send the new team member a welcome & a new token
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})

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

  // Give the team lead new suggested actions
  if (teamLeadUserIdWithNewActions) {
    // the team lead just needs data about themselves. alternatively we could make an eg AcceptTeamInvitationTeamLeadPayload, but nulls are just as good
    publish(
      SubscriptionChannel.NOTIFICATION,
      teamLeadUserIdWithNewActions,
      'AcceptTeamInvitationPayload',
      {teamLeadId: teamLeadUserIdWithNewActions},
      subOptions
    )
  }
  segmentIo.track({
    userId: viewerId,
    event: 'Invite Accepted',
    properties: {teamId}
  })
  return {
    ...data,
    authToken: encodedAuthToken
  }
}

export default acceptTeamInvitation
