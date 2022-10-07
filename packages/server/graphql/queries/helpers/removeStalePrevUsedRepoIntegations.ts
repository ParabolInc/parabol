import ms from 'ms'
import {RepoIntegration as RepoIntegrationType} from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import getRedis from '../../../utils/getRedis'

const removeStalePrevUsedRepoIntegrations = async (
  prevUsedRepoIntegrations: RepoIntegrationType[] | null,
  prevUsedRepoIntegrationsKey: string
) => {
  if (!prevUsedRepoIntegrations) return
  const sixMonthsAgo = Date.now() - ms('180d')
  const redis = getRedis()
  await redis.zremrangebyscore(prevUsedRepoIntegrationsKey, '-inf', sixMonthsAgo)
}

export default removeStalePrevUsedRepoIntegrations
