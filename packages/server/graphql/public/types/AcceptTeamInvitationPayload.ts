import {isTeamMember} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import isValid from '../../isValid'
import type {AcceptTeamInvitationPayloadResolvers, UserError} from '../resolverTypes'

export type AcceptTeamInvitationPayloadSource = {
  error?: {message: string}
  userErrors?: UserError[]
  meetingId?: string | null
  teamId?: string
  teamMemberId?: string
  invitationNotificationIds?: string[]
  authToken?: string
  teamLeadId?: string
}

const AcceptTeamInvitationPayload: AcceptTeamInvitationPayloadResolvers = {
  team: ({teamId}, _args, {authToken, dataLoader}: GQLContext) => {
    return teamId
      ? dataLoader.get('teamsWithUserSort').loadNonNull({teamId, userId: authToken.sub})
      : null
  },
  teamMember: async ({teamMemberId}, _args, {dataLoader}: GQLContext) => {
    return teamMemberId ? dataLoader.get('teamMembers').loadNonNull(teamMemberId) : null
  },
  meeting: async ({meetingId}, _args, {dataLoader, authToken}) => {
    if (!meetingId) {
      return null
    }
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting || !isTeamMember(authToken, meeting.teamId)) return null
    return meeting
  },

  notifications: async ({invitationNotificationIds}, _args, {dataLoader}) => {
    if (!invitationNotificationIds) {
      return null
    }
    const teamInvitationNotifications = (
      await dataLoader.get('notifications').loadMany(invitationNotificationIds)
    )
      .filter(isValid)
      .filter((n) => n.type === 'TEAM_INVITATION')
    return teamInvitationNotifications
  },

  teamLead: async ({teamLeadId}, _args, {dataLoader}) => {
    return teamLeadId ? dataLoader.get('users').loadNonNull(teamLeadId) : null
  },

  userErrors: ({userErrors}) => userErrors ?? []
}

export default AcceptTeamInvitationPayload
