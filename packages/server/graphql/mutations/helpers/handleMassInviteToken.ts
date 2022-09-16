import {InvitationTokenError} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import TeamInvitation from '../../../database/types/TeamInvitation'
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
  const invitation = new TeamInvitation({
    token: invitationToken,
    invitedBy,
    meetingId,
    teamId,
    expiresAt,
    email
  })
  await r.table('TeamInvitation').insert(invitation).run()
  return {invitation}
}

export default handleMassInviteToken
