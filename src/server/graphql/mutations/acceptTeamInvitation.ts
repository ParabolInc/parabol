import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import {
  sendInvitationExpiredError,
  sendNotAuthenticatedAccessError,
  sendTeamAlreadyJoinedError
} from 'server/utils/authorizationErrors'
import {sendInvitationNotFoundError} from 'server/utils/docNotFoundErrors'
import publish from 'server/utils/publish'
import {TEAM_INVITATION_LIFESPAN} from 'server/utils/serverConstants'
import {NEW_AUTH_TOKEN, NOTIFICATION, TEAM, UPDATED} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import acceptTeamInvitation from '../../safeMutations/acceptTeamInvitation'
import AcceptTeamInvitationPayload from '../types/AcceptTeamInvitationPayload'

export default {
  type: new GraphQLNonNull(AcceptTeamInvitationPayload),
  description: `Redeem an invitation token for a logged in user`,
  args: {
    invitationToken: {
      type: GraphQLID,
      description: 'The invitation token (first 6 bytes are the id, next 8 are the pre-hash)'
    }
  },
  async resolve (_source, {invitationToken}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!isAuthenticated(authToken)) return sendNotAuthenticatedAccessError()

    // VALIDATION
    const invitation = await r
      .table('TeamInvitation')
      .getAll(invitationToken, {index: 'token'})
      .nth(0)
      .default(null)
    if (!invitation) {
      return sendInvitationNotFoundError(authToken, invitationToken)
    }
    const {id: invitationId, acceptedAt, createdAt, teamId} = invitation
    const expirationThresh = new Date(Date.now() - TEAM_INVITATION_LIFESPAN)
    if (acceptedAt || createdAt < expirationThresh) {
      return sendInvitationExpiredError(authToken, invitationToken)
    }

    const viewer = await r.table('User').get(viewerId)
    if (viewer.tms && viewer.tms.includes(teamId)) {
      return sendTeamAlreadyJoinedError(authToken, invitationToken)
    }

    // RESOLUTION
    const removedNotificationIds = await acceptTeamInvitation(
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
    publish(NOTIFICATION, viewerId, AcceptTeamInvitationPayload, data, subOptions)

    // Tell the rest of the team about the new team member
    publish(TEAM, teamId, AcceptTeamInvitationPayload, data, subOptions)

    return data
  }
}
