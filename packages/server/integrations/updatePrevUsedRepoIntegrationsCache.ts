import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import getAllCachedRepoIntegrations from '../graphql/queries/helpers/getAllCachedRepoIntegrations'
import getPrevUsedRepoIntegrations from '../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import getPrevUsedRepoIntegrationsRedisKey from '../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../utils/getRedis'

const updatePrevUsedRepoIntegrationsCache = async (teamId: string, repoIntegrationId: string) => {
  const redis = getRedis()
  const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const [prevUsedRepoIntegrations, allRepoIntegrations] = await Promise.all([
    getPrevUsedRepoIntegrations(teamId),
    getAllCachedRepoIntegrations(teamId)
  ])
  const remoteRepoIntegration = allRepoIntegrations?.find((remoteRepoIntegration) => {
    const remoteRepoIntegrationId = IntegrationRepoId.join(remoteRepoIntegration)
    return remoteRepoIntegrationId === repoIntegrationId
  })
  if (!remoteRepoIntegration) return
  const now = Date.now()
  const oldPrevUsedRepoIntegration = prevUsedRepoIntegrations?.find((prevUsedRepoIntegration) => {
    const prevUsedRepoIntegrationId = IntegrationRepoId.join(prevUsedRepoIntegration)
    return prevUsedRepoIntegrationId === repoIntegrationId
  })
  if (oldPrevUsedRepoIntegration) {
    await redis.zrem(prevUsedRepoIntegrationsKey, JSON.stringify(oldPrevUsedRepoIntegration))
  }
  await redis.zadd(prevUsedRepoIntegrationsKey, now, JSON.stringify(remoteRepoIntegration))
}

export default updatePrevUsedRepoIntegrationsCache
