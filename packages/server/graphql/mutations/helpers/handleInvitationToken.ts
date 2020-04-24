import getIsMassInviteToken from './getIsMassInviteToken'
import handleMassInviteToken from './handleMassInviteToken'
import handleTeamInviteToken from './handleTeamInviteToken'
import getRethink from '../../../database/rethinkDriver'
import {DataLoaderWorker} from '../../graphql'

const handleInvitationToken = async (
  invitationToken: string,
  viewerId: string,
  dataLoader: DataLoaderWorker,
  notificationId?: string
) => {
  const r = await getRethink()
  const viewer = await r
    .table('User')
    .get(viewerId)
    .run()
  const {email, tms} = viewer
  const isMassInviteToken = getIsMassInviteToken(invitationToken)
  if (isMassInviteToken) return handleMassInviteToken(invitationToken, email, tms, dataLoader)
  return handleTeamInviteToken(invitationToken, viewerId, tms, notificationId)
}

export default handleInvitationToken
