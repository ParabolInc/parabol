import {InvitationTokenError} from 'parabol-client/types/constEnums'
import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import {DataLoaderWorker} from '../graphql/graphql'

interface ErrorRes {
  error: InvitationTokenError
}

interface SuccessRes {
  meetingId: string | undefined
  teamId: string
  userId: string
  exp: Date
}

export const verifyMassInviteToken = async (token: string, dataLoader: DataLoaderWorker) => {
  const tokenDoc = await dataLoader.get('massInvitations').load(token)
  if (!tokenDoc) {
    return {error: InvitationTokenError.NOT_FOUND} as ErrorRes
  }
  const {expiration, teamMemberId, meetingId} = tokenDoc
  const {teamId, userId} = fromTeamMemberId(teamMemberId)
  if (expiration < new Date()) {
    return {error: InvitationTokenError.EXPIRED, teamId, userId} as ErrorRes
  }
  return {meetingId, teamId, userId, exp: expiration} as SuccessRes
}
