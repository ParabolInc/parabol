import getKysely from '../postgres/getKysely'
import {selectTeamMemberIntegrationAuth} from '../postgres/select'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import logError from '../utils/logError'

export type RefreshFailedAuth = Pick<
  TeamMemberIntegrationAuth,
  'id' | 'userId' | 'teamId' | 'providerId' | 'providerUserId' | 'service' | 'accessToken'
>

/**
 * A refresh that failed either lost a race to another request that already rotated the tokens
 * (that row is returned, still usable) or means the grant is dead, in which case every row sharing
 * the token family is disconnected so the user is prompted to reconnect instead of silently failing
 */
const handleAuthRefreshFailure = async (
  error: Error,
  auth: RefreshFailedAuth
): Promise<TeamMemberIntegrationAuth | null> => {
  const {id, userId, teamId, providerId, providerUserId, service, accessToken} = auth
  const current = await selectTeamMemberIntegrationAuth()
    .where('id', '=', id)
    .where('isActive', '=', true)
    .executeTakeFirst()
  if (current && current.accessToken !== accessToken) return current
  logError(error, {userId, tags: {teamId, service}})
  await getKysely()
    .updateTable('TeamMemberIntegrationAuth')
    .set({isActive: false})
    .where('userId', '=', userId)
    .where('providerId', '=', providerId)
    .where('isActive', '=', true)
    .$if(providerUserId === null, (qb) => qb.where('teamId', '=', teamId))
    .$if(providerUserId !== null, (qb) => qb.where('providerUserId', '=', providerUserId))
    .execute()
  return null
}

export default handleAuthRefreshFailure
