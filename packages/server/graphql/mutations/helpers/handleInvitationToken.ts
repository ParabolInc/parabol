import getIsMassInviteToken from './getIsMassInviteToken'
import handleMassInviteToken from './handleMassInviteToken'
import handleTeamInviteToken from './handleTeamInviteToken'
import getRethink from '../../../database/rethinkDriver'

const handleInvitationToken = async (
  invitationToken: string,
  viewerId: string,
  notificationId?: string
) => {
  const r = await getRethink()
  const viewer = await r
    .table('User')
    .get(viewerId)
    .run()
  const {email, tms} = viewer
  const isMassInviteToken = getIsMassInviteToken(invitationToken)
  if (isMassInviteToken) return handleMassInviteToken(invitationToken, email)
  return handleTeamInviteToken(invitationToken, viewerId, tms, notificationId)
}

export default handleInvitationToken
