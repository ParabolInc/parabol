import db from '../../../db'
import {DataLoaderWorker} from '../../graphql'
import getIsMassInviteToken from './getIsMassInviteToken'
import handleMassInviteToken from './handleMassInviteToken'
import handleTeamInviteToken from './handleTeamInviteToken'

const handleInvitationToken = async (
  invitationToken: string,
  viewerId: string,
  dataLoader: DataLoaderWorker,
  notificationId?: string
) => {
  const viewer = await db.read('User', viewerId)
  const {email, tms} = viewer
  const isMassInviteToken = getIsMassInviteToken(invitationToken)
  if (isMassInviteToken) return handleMassInviteToken(invitationToken, email, tms, dataLoader)
  return handleTeamInviteToken(invitationToken, viewerId, tms, notificationId)
}

export default handleInvitationToken
