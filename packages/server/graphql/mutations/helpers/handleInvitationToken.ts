import type {DataLoaderWorker} from '../../graphql'
import getIsMassInviteToken from './getIsMassInviteToken'
import handleMassInviteToken from './handleMassInviteToken'
import handleTeamInviteToken from './handleTeamInviteToken'

const handleInvitationToken = async (
  invitationToken: string,
  viewerId: string,
  dataLoader: DataLoaderWorker,
  notificationId?: string
) => {
  const [viewer, tms] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dataLoader.get('teamIdsByUserId').load(viewerId)
  ])
  const {email} = viewer
  const isMassInviteToken = getIsMassInviteToken(invitationToken)
  if (isMassInviteToken) return handleMassInviteToken(invitationToken, email, tms, dataLoader)
  return handleTeamInviteToken(invitationToken, viewer, tms, notificationId)
}

export default handleInvitationToken
