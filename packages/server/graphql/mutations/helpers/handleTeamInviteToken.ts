import {InvitationTokenError} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {selectNotifications} from '../../../postgres/select'

const handleTeamInviteToken = async (
  invitationToken: string,
  viewerId: string,
  tms: string[],
  notificationId?: string
) => {
  const pg = getKysely()
  const invitation = await pg
    .selectFrom('TeamInvitation')
    .selectAll()
    .where('token', '=', invitationToken)
    .limit(1)
    .executeTakeFirst()
  if (!invitation) return {error: InvitationTokenError.NOT_FOUND}
  const {expiresAt} = invitation
  if (expiresAt.getTime() < Date.now()) {
    // using the notification has no expiry
    const notification = notificationId
      ? await selectNotifications()
          .where('id', '=', notificationId)
          .where('userId', '=', viewerId)
          .executeTakeFirst()
      : undefined
    if (!notification) {
      return {error: InvitationTokenError.EXPIRED}
    }
  }
  const {acceptedAt, teamId, meetingId} = invitation
  if (acceptedAt || tms?.includes(teamId)) {
    return {error: InvitationTokenError.ALREADY_ACCEPTED, teamId, meetingId}
  }
  return {invitation}
}

export default handleTeamInviteToken
