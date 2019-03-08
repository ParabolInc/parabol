import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import rateLimit from 'server/graphql/rateLimit'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import encodeAuthTokenObj from 'server/utils/encodeAuthTokenObj'
import makeAuthTokenObj from 'server/utils/makeAuthTokenObj'
import publish from 'server/utils/publish'
import {NEW_AUTH_TOKEN, NOTIFICATION, TEAM, UPDATED} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import acceptTeamInvitation from '../../safeMutations/acceptTeamInvitation'
import standardError from '../../utils/standardError'
import AcceptTeamInvitationPayload from '../types/AcceptTeamInvitationPayload'

export default {
  type: new GraphQLNonNull(AcceptTeamInvitationPayload),
  description: `Redeem an invitation token for a logged in user`,
  args: {
    invitationToken: {
      type: GraphQLID,
      description: 'The 48-byte hex encoded invitation token'
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
      const invitation = await r
        .table('TeamInvitation')
        .getAll(invitationToken, {index: 'token'})
        .nth(0)
        .default(null)
      if (!invitation) {
        return standardError(new Error('Invitation not found'), {userId: viewerId})
      }
      const {id: invitationId, acceptedAt, expiresAt, teamId} = invitation
      if (expiresAt < now) {
        // using the notification has no expiry
        if (notificationId) {
          const notification = await r.table('Notification').get(notificationId)
          if (!notification || notification.userIds[0] !== viewerId) {
            return standardError(new Error('Invitation expired'), {userId: viewerId})
          }
        }
      }

      const viewer = await r.table('User').get(viewerId)
      if (acceptedAt || (viewer.tms && viewer.tms.includes(teamId))) {
        return standardError(new Error('Team already joined'), {userId: viewerId})
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
