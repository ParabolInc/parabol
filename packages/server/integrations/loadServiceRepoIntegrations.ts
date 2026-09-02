import ms from 'ms'
import getRedis from '../utils/getRedis'
import getRepoIntegrationsRedisKey from '../utils/getRepoIntegrationsRedisKey'
import logError from '../utils/logError'
import type {RemoteRepoIntegration} from './platform/RemoteRepoIntegration'
import {getServerIntegration, type RegisteredServerIntegration} from './platform/registry'
import type {GqlIntegrationCtx} from './platform/ServerIntegrationDefinition'

/**
 * One service's repo list for the user on this team: the cached list when present, else a live
 * fetch that is cached on success (briefly when empty, so a first repo shows up without a reconnect).
 * [] when the service is not connected or has no usable token; null when the fetch failed
 */
const loadServiceRepoIntegrations = async (
  service: RegisteredServerIntegration,
  ctx: GqlIntegrationCtx,
  networkOnly: boolean
): Promise<RemoteRepoIntegration[] | null> => {
  const {dataLoader, teamId, userId} = ctx
  const definition = getServerIntegration(service)
  const {repoList} = definition.capabilities
  if (!repoList) return []
  if (!networkOnly) {
    const cached = await dataLoader.get('cachedRepoIntegrations').load({service, teamId, userId})
    if (cached) return cached
  }
  if (!(await definition.isConnected(ctx))) return []
  const auth = await definition.resolveAuth(ctx)
  if (!auth) return []
  const repos = await repoList
    .fetchRepos(ctx)
    .catch((e: unknown) => (e instanceof Error ? e : new Error(String(e))))
  if (repos instanceof Error) {
    logError(repos, {userId, tags: {teamId, service}})
    return null
  }
  const key = getRepoIntegrationsRedisKey(service, teamId, userId)
  await getRedis().set(key, JSON.stringify(repos), 'PX', ms(repos.length ? '90d' : '1h'))
  return repos
}

export default loadServiceRepoIntegrations
