import getKysely from '../getKysely'

export interface TeamMemberIntegrationAuthTokens {
  accessToken: string
  refreshToken: string | null
  scopes: string | null
  expiresAt: Date | null
}

interface SyncTeamMemberIntegrationAuthTokensInput extends TeamMemberIntegrationAuthTokens {
  userId: string
  teamId: string
  providerId: number
  providerUserId: string | null
}

// A user's rows for the same provider account share one token family: some providers
// (Atlassian: https://github.com/ParabolInc/parabol/issues/5601) revoke the previous family
// whenever a new one is issued, so every sibling row must receive the new tokens together.
// Without a providerUserId the account can't be told apart from another one the user
// connected on a sibling team, so only the originating row is written
const syncTeamMemberIntegrationAuthTokens = async (
  input: SyncTeamMemberIntegrationAuthTokensInput
) => {
  const {userId, teamId, providerId, providerUserId, ...tokens} = input
  return getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set(tokens)
    .where('userId', '=', userId)
    .where('providerId', '=', providerId)
    .where('isActive', '=', true)
    .$if(providerUserId === null, (qb) => qb.where('teamId', '=', teamId))
    .$if(providerUserId !== null, (qb) => qb.where('providerUserId', '=', providerUserId))
    .execute()
}

export default syncTeamMemberIntegrationAuthTokens
