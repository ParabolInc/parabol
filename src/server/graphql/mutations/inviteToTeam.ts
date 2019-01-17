import crypto from 'crypto'
import promisify from 'es6-promisify'
import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import sendEmailPromise from 'server/email/sendEmail'
import rateLimit from 'server/graphql/rateLimit'
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import makeAppLink from 'server/utils/makeAppLink'
import publish from 'server/utils/publish'
import shortid from 'shortid'
import {NOTIFICATION, TEAM_INVITATION} from 'universal/utils/constants'
import InviteToTeamPayload from '../types/InviteToTeamPayload'
import {TEAM_INVITATION_LIFESPAN} from 'server/utils/serverConstants'

const randomBytes = promisify(crypto.randomBytes, crypto)

interface NotificationToInsert {
  id: string
  type: string
  startAt: Date
  userIds: Array<string>
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
      const r = getRethink()
      const now = new Date()

      // AUTH
      const viewerId = getUserId(authToken)
      if (!isTeamMember(authToken, teamId)) {
        return sendTeamAccessError(authToken, teamId)
      }

      // RESOLUTION
      const subOptions = {mutatorId, operationId}
      const users = await r.table('User').getAll(r.args(invitees), {index: 'email'})

      const uniqueInvitees = Array.from(new Set(invitees))
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
      const teamInvitationsToInsert = newInvitees.map((email, idx) => ({
        id: shortid.generate(),
        acceptedAt: null,
        createdAt: now,
        expiresAt,
        email,
        invitedBy: viewerId,
        teamId,
        token: tokens[idx]
      }))
      await r.table('TeamInvitation').insert(teamInvitationsToInsert)

      // remove suggested action, if any
      let removedSuggestedActionId
      if (isOnboardTeam) {
        removedSuggestedActionId = await r
          .table('SuggestedAction')
          .getAll(viewerId, {index: 'userId'})
          .filter({type: 'inviteYourTeam', removedAt: null})
          .update({removedAt: now}, {returnChanges: true})('changes')(0)('new_val')('id')
          .default(null)
      }
      // insert notification records
      const notificationsToInsert = [] as Array<NotificationToInsert>
      teamInvitationsToInsert.forEach((invitation) => {
        const user = users.find((user) => user.email === invitation.email)
        if (user) {
          notificationsToInsert.push({
            id: shortid.generate(),
            type: TEAM_INVITATION,
            startAt: now,
            userIds: [user.id],
            invitationId: invitation.id,
            teamId
          })
        }
      })
      if (notificationsToInsert.length > 0) {
        await r.table('Notification').insert(notificationsToInsert)
      }

      // send emails
      await Promise.all(
        teamInvitationsToInsert.map((invitation) => {
          const user = users.find((user) => user.email === invitation.email)
          return sendEmailPromise(invitation.email, 'teamInvite', {
            inviteLink: makeAppLink(`team-invitation/${invitation.token}`),
            inviteeName: user ? user.preferredName : null,
            inviteeEmail: invitation.email,
            inviterName: inviter.preferredName,
            inviterEmail: inviter.email,
            teamName
          })
        })
      )

      const data = {
        removedSuggestedActionId,
        teamId,
        invitees: newInvitees
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
        publish(NOTIFICATION, userId, InviteToTeamPayload, subscriberData, subOptions)
      })

      return data
    }
  )
}
