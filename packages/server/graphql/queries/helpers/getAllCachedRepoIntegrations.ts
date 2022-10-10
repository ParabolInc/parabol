import getAllRepoIntegrationsRedisKey from '../../../utils/getAllRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'
import {RemoteRepoIntegration} from './fetchAllRepoIntegrations'

const getAllCachedRepoIntegrations = async (teamId: string) => {
  const redis = getRedis()
  const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId)
  const allRepoIntegrationsRes = await redis.get(allRepoIntegrationsKey)
  return allRepoIntegrationsRes
    ? (JSON.parse(allRepoIntegrationsRes) as RemoteRepoIntegration[])
    : null
}

export default getAllCachedRepoIntegrations
