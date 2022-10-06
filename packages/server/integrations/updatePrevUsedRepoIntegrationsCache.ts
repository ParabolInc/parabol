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
  const prevUsedRepoIntegrationsRes = await redis.get(prevUsedRepoIntegrationsKey)
  const repoIntegrationWithLastUsedAt = {
    ...repoIntegration,
    lastUsedAt: new Date()
  }
  if (!prevUsedRepoIntegrationsRes) {
    redis.set(prevUsedRepoIntegrationsKey, JSON.stringify([repoIntegrationWithLastUsedAt]))
  } else {
    const prevUsedRepoIntegrations = JSON.parse(
      prevUsedRepoIntegrationsRes
    ) as RepoIntegrationWithLastUsedAt[]
    const repoIntegrationId = IntegrationRepoId.join(repoIntegration)
    const hasRepoIntegration = prevUsedRepoIntegrations.some((prevUsedRepoIntegration) => {
      const prevUsedRepoIntegrationId = IntegrationRepoId.join(prevUsedRepoIntegration)
      return prevUsedRepoIntegrationId === repoIntegrationId
    })
    if (hasRepoIntegration) {
      const updatedPrevUsedRepoIntegrations = prevUsedRepoIntegrations.map(
        (prevUsedRepoIntegration) => {
          const prevUsedRepoIntegrationId = IntegrationRepoId.join(prevUsedRepoIntegration)
          if (prevUsedRepoIntegrationId === repoIntegrationId) {
            return repoIntegrationWithLastUsedAt
          }
          return prevUsedRepoIntegration
        }
      )
      redis.set(prevUsedRepoIntegrationsKey, JSON.stringify(updatedPrevUsedRepoIntegrations))
    } else {
      const updatedPrevUsedRepoIntegrations = [
        repoIntegrationWithLastUsedAt,
        ...prevUsedRepoIntegrations
      ]
      redis.set(prevUsedRepoIntegrationsKey, JSON.stringify(updatedPrevUsedRepoIntegrations))
    }
  }
}

export default updatePrevUsedRepoIntegrationsCache
