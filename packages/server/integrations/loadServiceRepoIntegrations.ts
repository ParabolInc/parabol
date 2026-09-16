import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {makeIntegrationServiceSource} from '../graphql/public/types/IntegrationService'
import getRepoIntegrationsRedisKey from '../utils/getRepoIntegrationsRedisKey'
import logError from '../utils/logError'
import publish from '../utils/publish'
import {redisStoreAndNetwork} from '../utils/redisStoreAndNetwork'
import type {RemoteRepoIntegration} from './platform/RemoteRepoIntegration'
import {getServerIntegration, type RegisteredServerIntegration} from './platform/registry'
import type {GqlIntegrationCtx} from './platform/ServerIntegrationDefinition'

const REFRESH_AFTER = ms('1m')
const CACHE_TTL = ms('2d')

/**
 * One service's repo list for the user on this team, served from Redis and refreshed in the
 * background once it is older than REFRESH_AFTER. A refresh that changes the list is pushed to the user.
 * [] when the service is not connected; null when the fetch failed or the token is unusable
 */
const loadServiceRepoIntegrations = async (
  service: RegisteredServerIntegration,
  ctx: GqlIntegrationCtx
): Promise<RemoteRepoIntegration[] | null> => {
  const {teamId, userId} = ctx
  const definition = getServerIntegration(service)
  const {repoList} = definition.capabilities
  if (!repoList) return []
  if (!(await definition.isConnected(ctx))) return []
  const fetchRepos = async () => {
    const auth = await definition.resolveAuth(ctx)
    if (!auth) return new Error(`${service} auth has no usable token`)
    const repos = await repoList
      .fetchRepos(ctx)
      .catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))))
    if (repos instanceof Error) logError(repos, {userId, tags: {teamId, service}})
    return repos
  }
  const repos = await redisStoreAndNetwork(
    getRepoIntegrationsRedisKey(service, teamId, userId),
    fetchRepos,
    (repos) => repos,
    {
      maxAge: REFRESH_AFTER,
      ttl: CACHE_TTL,
      onUpdate: () => {
        publish(
          SubscriptionChannel.NOTIFICATION,
          userId,
          'IntegrationService',
          makeIntegrationServiceSource(service, teamId, userId)
        )
      }
    }
  )
  return repos instanceof Error ? null : repos
}

export default loadServiceRepoIntegrations
