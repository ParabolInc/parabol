import type {Kysely} from 'kysely'
import type {DB} from '../../postgres/types/pg'

interface SyncJiraSiblingAuthsInput {
  userId: string
  providerUserId: string
  accessToken: string
  refreshToken: string | null
  scopes: string | null
  expiresAt: Date | null
  excludeTeamId?: string
}

// Atlassian rotates refresh tokens: after any exchange, every other active row for the
// same (user, account) must receive the new token family or its refresh token is dead
// (https://github.com/ParabolInc/parabol/issues/5601)
const syncJiraSiblingAuths = async (pg: Kysely<DB>, input: SyncJiraSiblingAuthsInput) => {
  const {userId, providerUserId, accessToken, refreshToken, scopes, expiresAt, excludeTeamId} =
    input
  return pg
    .updateTable('TeamMemberIntegrationAuth')
    .set({accessToken, refreshToken, scopes, expiresAt})
    .where('userId', '=', userId)
    .where('service', '=', 'jira')
    .where('providerUserId', '=', providerUserId)
    .where('isActive', '=', true)
    .$if(!!excludeTeamId, (qb) => qb.where('teamId', '!=', excludeTeamId!))
    .execute()
}

export default syncJiraSiblingAuths
