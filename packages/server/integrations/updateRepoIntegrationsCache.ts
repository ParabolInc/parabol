import ms from 'ms'
import {RepoIntegration} from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import getAllRepoIntegrationsRedisKey from '../utils/getAllRepoIntegrationsRedisKey'
import getPrevUsedRepoIntegrationsRedisKey from '../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../utils/getRedis'

const updateRepoIntegrationsCache = async (teamId: string, repoIntegration: RepoIntegration) => {
  const redis = getRedis()
  const key = getAllRepoIntegrationsRedisKey(teamId)

  // add or update prevUsedRepoIntegrations
  // remove from all if it exists
  const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const prevUsedRepoIntegrations = await redis.get(prevUsedRepoIntegrationsKey)
  const repoIntegrationWithLastUsedAt = {
    ...repoIntegration,
    lastUsedAt: new Date()
  }
  if (!prevUsedRepoIntegrations) {
    await redis.set(
      prevUsedRepoIntegrationsKey,
      JSON.stringify([repoIntegrationWithLastUsedAt]),
      'PX',
      ms('180d')
    )
  }

  return await redis.get(prevUsedRepoIntegrationsKey)
}

export default updateRepoIntegrationsCache
