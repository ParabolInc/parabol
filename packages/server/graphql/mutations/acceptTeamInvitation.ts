import {GraphQLID, GraphQLNonNull} from 'graphql'
import rateLimit from '../rateLimit'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import publish from '../../utils/publish'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import acceptTeamInvitation from '../../safeMutations/acceptTeamInvitation'
import standardError from '../../utils/standardError'
import AcceptTeamInvitationPayload from '../types/AcceptTeamInvitationPayload'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import AuthToken from '../../database/types/AuthToken'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import AuthTokenPayload from '../types/AuthTokenPayload'
import encodeAuthToken from '../../utils/encodeAuthToken'
import handleInvitationToken from './helpers/handleInvitationToken'

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
      const invitationRes = await handleInvitationToken(invitationToken, viewerId, notificationId)
      if (invitationRes.error)
        return standardError(new Error(invitationRes.error), {userId: viewerId})
      const {invitation} = invitationRes
      const {teamId} = invitation
      // RESOLUTION
      const {teamLeadUserIdWithNewActions, removedNotificationIds} = await acceptTeamInvitation(
        teamId,
        viewerId,
        dataLoader
      )
      const tms = authToken.tms ? authToken.tms.concat(teamId) : [teamId]
      // IMPORTANT! mutate the current authToken so any queries or subscriptions can get the latest
      authToken.tms = tms
      const teamMemberId = toTeamMemberId(teamId, viewerId)

      const data = {
        teamId,
        teamMemberId,
        removedNotificationIds
      }

      const encodedAuthToken = encodeAuthToken(new AuthToken({tms, sub: viewerId}))

      // Send the new team member a welcome & a new token
      publish(SubscriptionChannel.NOTIFICATION, viewerId, AuthTokenPayload, {tms})

      // remove the old notifications
      if (removedNotificationIds.length > 0) {
        publish(
          SubscriptionChannel.NOTIFICATION,
          viewerId,
          AcceptTeamInvitationPayload,
          data,
          subOptions
        )
      }

      // Tell the rest of the team about the new team member
      publish(SubscriptionChannel.TEAM, teamId, AcceptTeamInvitationPayload, data, subOptions)

      // Give the team lead new suggested actions
      if (teamLeadUserIdWithNewActions) {
        // the team lead just needs data about themselves. alternatively we could make an eg AcceptTeamInvitationTeamLeadPayload, but nulls are just as good
        publish(
          SubscriptionChannel.NOTIFICATION,
          teamLeadUserIdWithNewActions,
          AcceptTeamInvitationPayload,
          {teamLeadId: teamLeadUserIdWithNewActions},
          subOptions
        )
      }
      sendSegmentEvent('Invite Accepted', viewerId, {teamId}).catch()
      return {
        ...data,
        authToken: encodedAuthToken
      }
    }
  )
}
