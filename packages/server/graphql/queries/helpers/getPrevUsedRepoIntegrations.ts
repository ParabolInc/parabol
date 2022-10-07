import {RepoIntegration as RepoIntegrationType} from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import getPrevUsedRepoIntegrationsRedisKey from '../../../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'

const getPrevUsedRepoIntegrations = async (teamId: string) => {
  const redis = getRedis()
  const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const prevUsedRepoIntegrationsRes = await redis.zrange(prevUsedRepoIntegrationsKey, 0, -1, 'REV')
  return prevUsedRepoIntegrationsRes.length
    ? (prevUsedRepoIntegrationsRes.map((prevUsedRepoIntegration) =>
        JSON.parse(prevUsedRepoIntegration)
      ) as RepoIntegrationType[])
    : null
}

export default getPrevUsedRepoIntegrations
