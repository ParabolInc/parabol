import IntegrationRepoId, {
  RepoIntegration as RepoIntegrationType
} from '../../../../client/shared/gqlIds/IntegrationRepoId'
import getAllRepoIntegrationsRedisKey from '../../../utils/getAllRepoIntegrationsRedisKey'
import getPrevUsedRepoIntegrationsRedisKey from '../../../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'

const getCachedRepoIntegrations = async (teamId: string) => {
  const redis = getRedis()
  const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId)
  const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const [allRepoIntegrationsRes, prevUsedRepoIntegrationsRes] = await Promise.all([
    redis.get(allRepoIntegrationsKey),
    redis.zrange(prevUsedRepoIntegrationsKey, 0, -1, 'REV')
  ])
  if (!allRepoIntegrationsRes) return []

  const allRepoIntegrations = JSON.parse(allRepoIntegrationsRes) as RepoIntegrationType[]
  if (!prevUsedRepoIntegrationsRes) return allRepoIntegrations

  const prevUsedRepoIntegrations = prevUsedRepoIntegrationsRes.map((prevUsedRepoIntegration) => {
    return JSON.parse(prevUsedRepoIntegration)
  })
  const prevUsedRepoIntegrationIds = prevUsedRepoIntegrations.map((repoIntegration) =>
    IntegrationRepoId.join(repoIntegration)
  )
  const unusedRepoIntegrations = allRepoIntegrations.filter((repoIntegration) => {
    const repoIntegrationId = IntegrationRepoId.join(repoIntegration)
    return !prevUsedRepoIntegrationIds.includes(repoIntegrationId)
  })
  return [...prevUsedRepoIntegrations, ...unusedRepoIntegrations]
  // .sort((a, b) =>
  //   a.lastUsedAt > b.lastUsedAt
  //     ? -1
  //     : a.service < b.service
  //     ? -1
  //     : a.id.toLowerCase() < b.id.toLowerCase()
  //     ? -1
  //     : 1
  // )
}

export default getCachedRepoIntegrations
