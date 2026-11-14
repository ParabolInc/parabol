import deactivateTeamMemberIntegrationAuthFamily from '../postgres/queries/deactivateTeamMemberIntegrationAuthFamily'
import {selectTeamMemberIntegrationAuth} from '../postgres/select'
import type {TeamMemberIntegrationAuth} from '../postgres/types'
import {Logger} from '../utils/Logger'
import logError from '../utils/logError'
import {isDeadGrant} from '../utils/OAuth2TokenError'
import {ThirdPartyResponseError} from '../utils/ThirdPartyResponseError'

export type RefreshFailedAuth = Pick<
  TeamMemberIntegrationAuth,
  'id' | 'userId' | 'teamId' | 'providerId' | 'providerUserId' | 'service' | 'accessToken'
>

/**
 * A refresh that failed either lost a race to another request that already rotated the tokens
 * (that row is returned, still usable) or means the grant is dead, in which case every row sharing
 * the token family is disconnected so the user is prompted to reconnect instead of silently failing.
 * A non-OAuth2 response (e.g. an HTML error page during an outage) says nothing about the grant, so it is kept.
 * A dead grant is the expected end of a connection, so it is not logged as an error
 */
const handleAuthRefreshFailure = async (
  error: Error,
  auth: RefreshFailedAuth
): Promise<TeamMemberIntegrationAuth | null> => {
  const {id, userId, teamId, service, accessToken} = auth
  const current = await selectTeamMemberIntegrationAuth()
    .where('id', '=', id)
    .where('isActive', '=', true)
    .executeTakeFirst()
  if (current && current.accessToken !== accessToken) return current
  const logOptions = {userId, tags: {teamId, service}}
  if (isDeadGrant(error)) {
    Logger.warn(error, logOptions)
  } else {
    logError(error, logOptions)
  }
  if (error instanceof ThirdPartyResponseError) return null
  await deactivateTeamMemberIntegrationAuthFamily(auth)
  return null
}

export default handleAuthRefreshFailure
