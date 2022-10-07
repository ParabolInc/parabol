import {RepoIntegration as RepoIntegrationType} from '../../../../client/shared/gqlIds/IntegrationRepoId'
import getAllRepoIntegrationsRedisKey from '../../../utils/getAllRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'

const getAllCachedRepoIntegrations = async (teamId: string) => {
  const redis = getRedis()
  const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId)
  const allRepoIntegrationsRes = await redis.get(allRepoIntegrationsKey)
  return allRepoIntegrationsRes
    ? (JSON.parse(allRepoIntegrationsRes) as RepoIntegrationType[])
    : null
}

export default getAllCachedRepoIntegrations
