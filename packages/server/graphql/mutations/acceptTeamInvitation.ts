import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import rateLimit from '../rateLimit'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import encodeAuthTokenObj from '../../utils/encodeAuthTokenObj'
import makeAuthTokenObj from '../../utils/makeAuthTokenObj'
import publish from '../../utils/publish'
import {NEW_AUTH_TOKEN, NOTIFICATION, TEAM, UPDATED} from '../../../universal/utils/constants'
import toTeamMemberId from '../../../universal/utils/relay/toTeamMemberId'
import acceptTeamInvitation from '../../safeMutations/acceptTeamInvitation'
import standardError from '../../utils/standardError'
import AcceptTeamInvitationPayload from '../types/AcceptTeamInvitationPayload'
import TeamInvitation from '../../database/types/TeamInvitation'
import {verifyMassInviteToken} from '../../utils/massInviteToken'

export default {
  type: new GraphQLNonNull(AcceptTeamInvitationPayload),
  description: `Redeem an invitation token for a logged in user`,
  args: {
    invitationToken: {
      type: GraphQLID,
      description:
        'The 48-byte hex encoded invitation token or the 2-part JWT for mass invitation tokens'
    },
    notificationId: {
      type: GraphQLID,
      description: 'the notification clicked to accept, if any'
    }
  },
  // rate limited because a notificationId subverts the expiration of the token & we don't want any brute forces for expired tokens
  resolve: rateLimit({
    perMinute: 50,
    perHour: 100
  })(
    async (
      _source,
      {invitationToken, notificationId},
      {authToken, dataLoader, socketId: mutatorId}
    ) => {
      const r = getRethink()
      const now = new Date()
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}

      // AUTH
      const viewerId = getUserId(authToken)
      if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
      if (!invitationToken) {
        return {
          error: {
            message: 'No invitation token provided'
          }
        }
      }

      // VALIDATION
      let invitation
      const viewer = await r.table('User').get(viewerId)
      const isMassInviteToken = invitationToken.indexOf('.') !== -1
      if (isMassInviteToken) {
        const validToken = verifyMassInviteToken(invitationToken)
        if (validToken.error) {
          return standardError(new Error(validToken.error), {userId: viewerId})
        }
        const {teamId, userId: invitedBy, exp: expiresAt} = validToken
        invitation = new TeamInvitation({
          token: invitationToken,
          invitedBy,
          teamId,
          expiresAt,
          email: viewer.email
        })
        await r.table('TeamInvitation').insert(invitation)
      } else {
        invitation = await r
          .table('TeamInvitation')
          .getAll(invitationToken, {index: 'token'})
          .nth(0)
          .default(null)
        if (!invitation) {
          return standardError(new Error('Invitation not found'), {userId: viewerId})
        }
        if (invitation.expiresAt < now) {
          // using the notification has no expiry
          const notification = notificationId
            ? await r.table('Notification').get(notificationId)
            : undefined
          if (!notification || notification.userIds[0] !== viewerId) {
            return standardError(new Error('Invitation expired'), {userId: viewerId})
          }
        }
      }
      const {id: invitationId, acceptedAt, teamId} = invitation
      if (acceptedAt || (viewer.tms && viewer.tms.includes(teamId))) {
        return {error: {message: 'Team already joined'}}
      }
      // RESOLUTION
      const {teamLeadUserIdWithNewActions, removedNotificationIds} = await acceptTeamInvitation(
        teamId,
        viewerId,
        invitationId,
        dataLoader
      )
      const tms = authToken.tms ? authToken.tms.concat(teamId) : [teamId]
      const teamMemberId = toTeamMemberId(teamId, viewerId)

      const data = {
        teamId,
        teamMemberId,
        removedNotificationIds
      }

      // Send the new team member a welcome & a new token
      publish(NEW_AUTH_TOKEN, viewerId, UPDATED, {tms})

      // remove the old notifications
      if (removedNotificationIds.length > 0) {
        publish(NOTIFICATION, viewerId, AcceptTeamInvitationPayload, data, subOptions)
      }

      // Tell the rest of the team about the new team member
      publish(TEAM, teamId, AcceptTeamInvitationPayload, data, subOptions)

      // Give the team lead new suggested actions
      if (teamLeadUserIdWithNewActions) {
        // the team lead just needs data about themselves. alternatively we could make an eg AcceptTeamInvitationTeamLeadPayload, but nulls are just as good
        publish(
          NOTIFICATION,
          teamLeadUserIdWithNewActions,
          AcceptTeamInvitationPayload,
          {teamLeadId: teamLeadUserIdWithNewActions},
          subOptions
        )
      }

      return {
        ...data,
        authToken: encodeAuthTokenObj(makeAuthTokenObj({...authToken, tms}))
      }
    }
  )
}
