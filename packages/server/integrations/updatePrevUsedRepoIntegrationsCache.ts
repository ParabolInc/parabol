import IntegrationRepoId, {RepoIntegration} from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import getPrevUsedRepoIntegrationsRedisKey from '../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../utils/getRedis'

type RepoIntegrationWithLastUsedAt = RepoIntegration & {
  lastUsedAt: Date
}

const updatePrevUsedRepoIntegrationsCache = async (
  teamId: string,
  repoIntegration: RepoIntegration
) => {
  const redis = getRedis()
  const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const prevUsedRepoIntegrationsRes = await redis.zrange(prevUsedRepoIntegrationsKey, 0, -1)
  const now = Date.now()
  const prevUsedRepoIntegrations = prevUsedRepoIntegrationsRes.map((prevUsedRepoIntegration) => {
    return JSON.parse(prevUsedRepoIntegration)
  }) as RepoIntegrationWithLastUsedAt[]
  const repoIntegrationId = IntegrationRepoId.join(repoIntegration)
  const oldPrevUsedRepoIntegration = prevUsedRepoIntegrations.find((prevUsedRepoIntegration) => {
    const prevUsedRepoIntegrationId = IntegrationRepoId.join(prevUsedRepoIntegration)
    return prevUsedRepoIntegrationId === repoIntegrationId
  })
  if (oldPrevUsedRepoIntegration) {
    await redis.zrem(prevUsedRepoIntegrationsKey, JSON.stringify(oldPrevUsedRepoIntegration))
  }
  await redis.zadd(prevUsedRepoIntegrationsKey, now, JSON.stringify(repoIntegration))

  // TODO: remove all that are older than 90 days
}

export default updatePrevUsedRepoIntegrationsCache
