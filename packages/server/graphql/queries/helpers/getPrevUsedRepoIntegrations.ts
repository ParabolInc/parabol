import getPrevUsedRepoIntegrationsRedisKey from '../../../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'
import {RemoteRepoIntegration} from './fetchAllRepoIntegrations'

const getPrevUsedRepoIntegrations = async (teamId: string) => {
  const redis = getRedis()
  const key = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const prevUsedRepoIntegrationsRes = await redis.zrange(key, 0, -1, 'REV')
  return prevUsedRepoIntegrationsRes.length
    ? (prevUsedRepoIntegrationsRes.map((prevUsedRepoIntegration: string) =>
        JSON.parse(prevUsedRepoIntegration)
      ) as RemoteRepoIntegration[])
    : null
}

export default getPrevUsedRepoIntegrations
