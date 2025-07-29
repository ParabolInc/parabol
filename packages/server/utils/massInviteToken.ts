import {InvitationTokenError} from 'parabol-client/types/constEnums'
import type {DataLoaderWorker} from '../graphql/graphql'

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
  const {expiration, teamId, userId, meetingId} = tokenDoc
  if (expiration < new Date()) {
    return {error: InvitationTokenError.EXPIRED, teamId, userId} as ErrorRes
  }
  return {meetingId, teamId, userId, exp: expiration} as SuccessRes
}
