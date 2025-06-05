import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'
import isValid from '../../isValid'
import {AcceptTeamInvitationPayloadResolvers} from '../resolverTypes'

export type AcceptTeamInvitationPayloadSource = {
  meetingId?: string | null
  teamId?: string
  teamMemberId?: string
  invitationNotificationIds?: string[]
  authToken?: string
  teamLeadId?: string
}

const AcceptTeamInvitationPayload: AcceptTeamInvitationPayloadResolvers = {
  team: ({teamId}, _args, {dataLoader}: GQLContext) => {
    return teamId ? dataLoader.get('teams').loadNonNull(teamId) : null
  },
  teamMember: async ({teamMemberId}, _args, {dataLoader}: GQLContext) => {
    return teamMemberId ? dataLoader.get('teamMembers').loadNonNull(teamMemberId) : null
  },
  meeting: async ({meetingId}, _args, {dataLoader, authToken}) => {
    if (!meetingId) {
      return null
    }
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      standardError(new Error('Meeting not found'), {userId: viewerId, tags: {meetingId}})
      return null
    }
    const {teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      standardError(new Error('Viewer not on team'), {userId: viewerId, tags: {teamId}})
      return null
    }
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
  }
}

export default AcceptTeamInvitationPayload
