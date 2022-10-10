import ms from 'ms'
import getRedis from '../../../utils/getRedis'
import {RemoteRepoIntegration} from './fetchAllRepoIntegrations'

const removeStalePrevUsedRepoIntegrations = async (
  prevUsedRepoIntegrations: RemoteRepoIntegration[] | null,
  prevUsedRepoIntegrationsKey: string
) => {
  if (!prevUsedRepoIntegrations) return
  const sixMonthsAgo = Date.now() - ms('180d')
  const redis = getRedis()
  await redis.zremrangebyscore(prevUsedRepoIntegrationsKey, '-inf', sixMonthsAgo)
}

export default removeStalePrevUsedRepoIntegrations
