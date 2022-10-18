import getRedis from '../../../utils/getRedis'
import {RemoteRepoIntegration} from './fetchAllRepoIntegrations'

const getAllCachedRepoIntegrations = async (key: string) => {
  const redis = getRedis()
  const allRepoIntegrationsRes = await redis.get(key)
  return allRepoIntegrationsRes
    ? (JSON.parse(allRepoIntegrationsRes) as RemoteRepoIntegration[])
    : null
}

export default getAllCachedRepoIntegrations
