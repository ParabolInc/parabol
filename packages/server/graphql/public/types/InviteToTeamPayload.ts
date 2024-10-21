import {TeamInvitationNotification} from '../../../postgres/types/Notification'
import {InviteToTeamPayloadResolvers} from '../resolverTypes'

export type InviteToTeamPayloadSource = {
  removedSuggestedActionId: string | undefined
  teamId: string
  invitees: string[]
  teamInvitationNotificationId?: string
}

const InviteToTeamPayload: InviteToTeamPayloadResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  teamInvitationNotification: async ({teamInvitationNotificationId}, _args, {dataLoader}) => {
    if (!teamInvitationNotificationId) return null
    const teamInvitation = await dataLoader
      .get('notifications')
      .loadNonNull<TeamInvitationNotification>(teamInvitationNotificationId)
    return teamInvitation
  }
}

export default InviteToTeamPayload
