import {InvitationTokenError} from 'parabol-client/types/constEnums'
import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import {DataLoaderWorker} from '../graphql/graphql'

export const verifyMassInviteToken = async (token: string, dataLoader: DataLoaderWorker) => {
  const tokenDoc = await dataLoader.get('massInvitations').load(token)
  if (!tokenDoc) {
    return {error: InvitationTokenError.NOT_FOUND}
  }
  const {expiration, teamMemberId} = tokenDoc
  const {teamId, userId} = fromTeamMemberId(teamMemberId)
  if (expiration < new Date()) {
    return {error: InvitationTokenError.EXPIRED, teamId, userId}
  }
  return {teamId, userId, exp: expiration}
}
