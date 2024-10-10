import {InvitationTokenError} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {verifyMassInviteToken} from '../../../utils/massInviteToken'
import {DataLoaderWorker} from '../../graphql'

const handleMassInviteToken = async (
  invitationToken: string,
  email: string,
  tms: string[],
  dataLoader: DataLoaderWorker
) => {
  const validToken = await verifyMassInviteToken(invitationToken, dataLoader)
  if ('error' in validToken) return {error: validToken.error}
  const r = await getRethink()
  const {teamId, userId: invitedBy, exp: expiresAt, meetingId} = validToken
  if (tms?.includes(teamId)) {
    return {error: InvitationTokenError.ALREADY_ACCEPTED, teamId, meetingId}
  }
  const invitation = {
    id: generateUID(),
    token: invitationToken,
    invitedBy,
    meetingId,
    teamId,
    expiresAt,
    email,
    isMassInvite: true,
    acceptedAt: null
  }
  await getKysely().insertInto('TeamInvitation').values(invitation).execute()
  await r
    .table('TeamInvitation')
    .insert({...invitation, createdAt: new Date()})
    .run()
  return {invitation}
}

export default handleMassInviteToken
