import crypto from 'crypto'
import promisify from 'es6-promisify'
import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import sendEmailPromise from '../../email/sendEmail'
import rateLimit from '../rateLimit'
import GraphQLEmailType from '../types/GraphQLEmailType'
import {getUserId, isTeamMember} from '../../utils/authorization'
import makeAppLink from '../../utils/makeAppLink'
import publish from '../../utils/publish'
import shortid from 'shortid'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import standardError from '../../utils/standardError'
import InviteToTeamPayload from '../types/InviteToTeamPayload'
import {TEAM_INVITATION_LIFESPAN} from '../../utils/serverConstants'
import TeamInvitation from '../../database/types/TeamInvitation'
import {NotificationEnum, SuggestedActionTypeEnum} from 'parabol-client/types/graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import sendSegmentEvent from '../../utils/sendSegmentEvent'

const randomBytes = promisify(crypto.randomBytes, crypto)

interface NotificationToInsert {
  id: string
  type: string
  startAt: Date
  userIds: string[]
  invitationId: string
  teamId: string
}

export default {
  type: new GraphQLNonNull(InviteToTeamPayload),
  description: 'Send a team invitation to an email address',
  args: {
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the inviting team'
    },
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLEmailType)))
    }
  },
  resolve: rateLimit({perMinute: 10, perHour: 100})(
    async (_source, {invitees, teamId}, {authToken, dataLoader, socketId: mutatorId}) => {
      const operationId = dataLoader.share()
      const r = await getRethink()
      const now = new Date()

      // AUTH
      const viewerId = getUserId(authToken)
      if (!isTeamMember(authToken, teamId)) {
        return standardError(new Error('Team not found'), {userId: viewerId})
      }

      // RESOLUTION
      const subOptions = {mutatorId, operationId}
      const users = await r
        .table('User')
        .getAll(r.args(invitees), {index: 'email'})
        .run()

      const uniqueInvitees = Array.from(new Set(invitees as string[]))
      // filter out emails already on team
      const newInvitees = uniqueInvitees.filter((email) => {
        const user = users.find((user) => user.email === email)
        return !(user && user.tms && user.tms.includes(teamId))
      })
      const team = await dataLoader.get('teams').load(teamId)
      const {name: teamName, isOnboardTeam} = team
      const inviter = await dataLoader.get('users').load(viewerId)
      const bufferTokens = await Promise.all<Buffer>(newInvitees.map(() => randomBytes(48)))
      const tokens = bufferTokens.map((buffer: Buffer) => buffer.toString('hex'))
      const expiresAt = new Date(Date.now() + TEAM_INVITATION_LIFESPAN)
      // insert invitation records
      const teamInvitationsToInsert = newInvitees.map((email, idx) => {
        return new TeamInvitation({
          expiresAt,
          email,
          invitedBy: viewerId,
          teamId,
          token: tokens[idx]
        })
      })
      await r
        .table('TeamInvitation')
        .insert(teamInvitationsToInsert)
        .run()

      // remove suggested action, if any
      let removedSuggestedActionId
      if (isOnboardTeam) {
        removedSuggestedActionId = await removeSuggestedAction(
          viewerId,
          SuggestedActionTypeEnum.inviteYourTeam
        )
      }
      // insert notification records
      const notificationsToInsert = [] as NotificationToInsert[]
      teamInvitationsToInsert.forEach((invitation) => {
        const user = users.find((user) => user.email === invitation.email)
        if (user) {
          notificationsToInsert.push({
            id: shortid.generate(),
            type: NotificationEnum.TEAM_INVITATION,
            startAt: now,
            userIds: [user.id],
            invitationId: invitation.id,
            teamId
          })
        }
      })
      if (notificationsToInsert.length > 0) {
        await r
          .table('Notification')
          .insert(notificationsToInsert)
          .run()
      }
      const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
      const [firstActiveMeeting] = activeMeetings

      // send emails
      const emailResults = await Promise.all(
        teamInvitationsToInsert.map((invitation) => {
          const user = users.find((user) => user.email === invitation.email)
          return sendEmailPromise(invitation.email, 'teamInvite', {
            inviteLink: makeAppLink(`team-invitation/${invitation.token}`),
            inviteeName: user ? user.preferredName : null,
            inviteeEmail: invitation.email,
            inviterName: inviter.preferredName,
            inviterEmail: inviter.email,
            teamName,
            meeting: firstActiveMeeting
          })
        })
      )

      const successfulInvitees = newInvitees.filter((_email, idx) => emailResults[idx])
      const data = {
        removedSuggestedActionId,
        teamId,
        invitees: successfulInvitees
      }

      // Tell each invitee
      notificationsToInsert.forEach((notification) => {
        const {
          userIds: [userId],
          id: teamInvitationNotificationId
        } = notification
        const subscriberData = {
          ...data,
          teamInvitationNotificationId
        }
        publish(
          SubscriptionChannel.NOTIFICATION,
          userId,
          'InviteToTeamPayload',
          subscriberData,
          subOptions
        )
      })
      sendSegmentEvent('Invite Email Sent', viewerId, {
        teamId,
        invitees: successfulInvitees
      }).catch()
      return data
    }
  )
}
