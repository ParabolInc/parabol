import ms from 'ms'
import getPrevUsedRepoIntegrations from '../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import getPrevUsedRepoIntegrationsRedisKey from '../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../utils/getRedis'
import loadServiceRepoIntegrations from './loadServiceRepoIntegrations'
import getRepoListCapability from './platform/getRepoListCapability'
import type {RemoteRepoIntegration} from './platform/RemoteRepoIntegration'
import type {RegisteredServerIntegration} from './platform/registry'
import type {GqlIntegrationCtx} from './platform/ServerIntegrationDefinition'

const updatePrevUsedRepoIntegrationsCache = async (
  service: RegisteredServerIntegration,
  integrationRepoId: string,
  ctx: GqlIntegrationCtx
) => {
  const {teamId} = ctx
  const isUsedRepo = (repo: RemoteRepoIntegration) =>
    repo.service === service &&
    getRepoListCapability(repo).integrationRepoId(repo) === integrationRepoId
  const prevUsedRepoIntegrations = await getPrevUsedRepoIntegrations(teamId)
  const usedRepo =
    prevUsedRepoIntegrations?.find(isUsedRepo) ??
    (await loadServiceRepoIntegrations(service, ctx))?.find(isUsedRepo)
  if (!usedRepo) return
  const redis = getRedis()
  const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  await redis.zadd(prevUsedRepoIntegrationsKey, Date.now(), JSON.stringify(usedRepo))
  await redis.pexpire(prevUsedRepoIntegrationsKey, ms('180d'))
}

export default updatePrevUsedRepoIntegrationsCache
