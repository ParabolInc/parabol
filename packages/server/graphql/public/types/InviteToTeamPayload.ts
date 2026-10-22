import type {TeamInvitationNotification} from '../../../postgres/types/Notification'
import type {InviteToTeamPayloadResolvers} from '../resolverTypes'

export type InviteToTeamPayloadSource = {
  teamInvitationNotificationId: string
}

const InviteToTeamPayload: InviteToTeamPayloadResolvers = {
  teamInvitationNotification: async ({teamInvitationNotificationId}, _args, {dataLoader}) => {
    return dataLoader
      .get('notifications')
      .loadNonNull<TeamInvitationNotification>(teamInvitationNotificationId)
  }
}

export default InviteToTeamPayload
