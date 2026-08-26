import type {RemoteRepoIntegration} from '../../../integrations/platform/RemoteRepoIntegration'
import getAllRepoIntegrationsRedisKey from '../../../utils/getAllRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'

const getAllCachedRepoIntegrations = async (teamId: string, viewerId: string) => {
  const redis = getRedis()
  const key = getAllRepoIntegrationsRedisKey(teamId, viewerId)
  const allRepoIntegrationsRes = await redis.get(key)
  return allRepoIntegrationsRes
    ? (JSON.parse(allRepoIntegrationsRes) as RemoteRepoIntegration[])
    : null
}

export default getAllCachedRepoIntegrations
