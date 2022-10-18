import getRedis from '../../../utils/getRedis'
import {RemoteRepoIntegration} from './fetchAllRepoIntegrations'

const getPrevUsedRepoIntegrations = async (key: string) => {
  const redis = getRedis()
  const prevUsedRepoIntegrationsRes = await redis.zrange(key, 0, -1, 'REV')
  return prevUsedRepoIntegrationsRes.length
    ? (prevUsedRepoIntegrationsRes.map((prevUsedRepoIntegration: string) =>
        JSON.parse(prevUsedRepoIntegration)
      ) as RemoteRepoIntegration[])
    : null
}

export default getPrevUsedRepoIntegrations
