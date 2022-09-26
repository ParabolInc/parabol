import crypto from 'crypto'
import {GraphQLID, GraphQLList, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import util from 'util'
import {isNotNull} from '../../../client/utils/predicates'
import appOrigin from '../../appOrigin'
import getRethink from '../../database/rethinkDriver'
import NotificationTeamInvitation from '../../database/types/NotificationTeamInvitation'
import TeamInvitation from '../../database/types/TeamInvitation'
import getMailManager from '../../email/getMailManager'
import teamInviteEmailCreator from '../../email/teamInviteEmailCreator'
import {getUsersByEmails} from '../../postgres/queries/getUsersByEmails'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isSuperUser, isTeamMember} from '../../utils/authorization'
import getBestInvitationMeeting from '../../utils/getBestInvitationMeeting'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import getIsEmailApprovedByOrg from '../public/mutations/helpers/getIsEmailApprovedByOrg'
import rateLimit from '../rateLimit'
import GraphQLEmailType from '../types/GraphQLEmailType'
import InviteToTeamPayload from '../types/InviteToTeamPayload'

const randomBytes = util.promisify(crypto.randomBytes)

export default {
  type: new GraphQLNonNull(InviteToTeamPayload),
  description: 'Send a team invitation to an email address',
  args: {
    meetingId: {
      type: GraphQLID,
      description: 'the specific meeting where the invite occurred, if any'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the inviting team'
    },
    invitees: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLEmailType)))
    }
  },
  resolve: rateLimit({perMinute: 10, perHour: 100})(
    async (
      _source: unknown,
      {
        invitees,
        meetingId,
        teamId
      }: {invitees: string[]; meetingId?: string | null; teamId: string},
      {authToken, dataLoader, socketId: mutatorId}: GQLContext
    ) => {
      const operationId = dataLoader.share()
      const r = await getRethink()
      const inviteTo = meetingId ? 'meeting' : 'team'

      // AUTH
      const viewerId = getUserId(authToken)
      if (!isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
        return standardError(new Error('Team not found'), {userId: viewerId})
      }

      // RESOLUTION
      const subOptions = {mutatorId, operationId}
      const [users, team, inviter] = await Promise.all([
        getUsersByEmails(invitees),
        dataLoader.get('teams').load(teamId),
        dataLoader.get('users').load(viewerId)
      ])
      if (!inviter) {
        return standardError(new Error('User not found'), {userId: viewerId})
      }
      if (!team) {
        return standardError(new Error('Team not found'), {userId: viewerId})
      }
      const {name: teamName, isOnboardTeam, orgId} = team
      const organization = await dataLoader.get('organizations').load(orgId)
      const {tier, name: orgName} = organization
      const uniqueInvitees = Array.from(new Set(invitees as string[]))
      // filter out emails already on team
      const newInvitees = uniqueInvitees.filter((email) => {
        const user = users.find((user) => user.email === email)
        return !(user && user.tms && user.tms.includes(teamId))
      })

      // filter out invitees that aren't approved by the org
      const approvalErrors = await Promise.all(
        newInvitees.map((email) => {
          return getIsEmailApprovedByOrg(email, orgId, dataLoader)
        })
      )
      const newAllowedInvitees = newInvitees
        .map((invitee, idx) => {
          return approvalErrors[idx] instanceof Error ? undefined : invitee
        })
        .filter(isNotNull)
      const tokens = await Promise.all(
        newAllowedInvitees.map(async () => (await randomBytes(48)).toString('hex'))
      )
      const expiresAt = new Date(Date.now() + Threshold.TEAM_INVITATION_LIFESPAN)
      // insert invitation records
      const teamInvitationsToInsert = newAllowedInvitees.map((email, idx) => {
        return new TeamInvitation({
          expiresAt,
          email,
          invitedBy: viewerId,
          meetingId: meetingId ?? undefined,
          teamId,
          token: tokens[idx]!
        })
      })
      await r.table('TeamInvitation').insert(teamInvitationsToInsert).run()

      // remove suggested action, if any
      let removedSuggestedActionId
      if (isOnboardTeam) {
        removedSuggestedActionId = await removeSuggestedAction(viewerId, 'inviteYourTeam')
      }
      // insert notification records
      const notificationsToInsert = [] as NotificationTeamInvitation[]
      teamInvitationsToInsert.forEach((invitation) => {
        const user = users.find((user) => user.email === invitation.email)
        if (user) {
          notificationsToInsert.push(
            new NotificationTeamInvitation({
              userId: user.id,
              invitationId: invitation.id,
              teamId
            })
          )
        }
      })
      if (notificationsToInsert.length > 0) {
        await r.table('Notification').insert(notificationsToInsert).run()
      }

      const bestMeeting = await getBestInvitationMeeting(teamId, meetingId ?? undefined, dataLoader)

      // send emails
      const searchParams = {
        utm_source: 'invite email',
        utm_medium: 'email',
        utm_campaign: 'invitations'
      }
      const options = {searchParams}
      const emailResults = await Promise.all(
        teamInvitationsToInsert.map((invitation) => {
          const user = users.find((user) => user.email === invitation.email)
          const {html, subject, body} = teamInviteEmailCreator({
            appOrigin,
            inviteLink: makeAppURL(appOrigin, `team-invitation/${invitation.token}`, options),
            inviteeName: user ? user.preferredName : '',
            inviteeEmail: invitation.email,
            inviterName: inviter.preferredName,
            inviterEmail: inviter.email,
            teamName,
            meeting: bestMeeting
          })
          return getMailManager().sendEmail({
            to: invitation.email,
            html,
            subject,
            body,
            tags: [
              'type:teamInvitation',
              `tier:${tier}`,
              `team:${teamName}:${orgName}:${teamId}:${orgId}`
            ]
          })
        })
      )

      const parabolUserEmails = users.map(({email}) => email)
      newAllowedInvitees.forEach(async (inviteeEmail, idx) => {
        const isInviteeParabolUser = parabolUserEmails.includes(inviteeEmail)
        const success = !!emailResults[idx]
        analytics.inviteEmailSent(
          viewerId,
          teamId,
          inviteeEmail,
          isInviteeParabolUser,
          inviteTo,
          success
        )
      })
      const successfulInvitees = newAllowedInvitees.filter((_email, idx) => emailResults[idx])
      const data = {
        removedSuggestedActionId,
        teamId,
        invitees: successfulInvitees
      }

      // Tell each invitee
      notificationsToInsert.forEach((notification) => {
        const {userId, id: teamInvitationNotificationId} = notification
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
      return data
    }
  )
}
