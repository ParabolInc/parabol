import type {TeamInvitationNotification} from '../../../postgres/types/Notification'
import type {InviteToTeamPayloadResolvers} from '../resolverTypes'

export type InviteToTeamPayloadSource =
  | {
      removedSuggestedActionId: string | undefined
      teamId: string
      invitees: string[]
      teamInvitationNotificationId?: string
    }
  | {error: {message: string}}

const InviteToTeamPayload: InviteToTeamPayloadResolvers = {
  team: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('teams').loadNonNull(source.teamId)
  },
  teamInvitationNotification: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    if (!source.teamInvitationNotificationId) return null
    const teamInvitation = await dataLoader
      .get('notifications')
      .loadNonNull<TeamInvitationNotification>(source.teamInvitationNotificationId)
    return teamInvitation
  }
}

export default InviteToTeamPayload
