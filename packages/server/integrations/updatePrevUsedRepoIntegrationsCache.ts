import ms from 'ms'
import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import getPrevUsedRepoIntegrations from '../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import type {Integrationproviderserviceenum} from '../postgres/types/pg'
import getPrevUsedRepoIntegrationsRedisKey from '../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../utils/getRedis'
import getRepoIntegrationsRedisKey from '../utils/getRepoIntegrationsRedisKey'
import type {RemoteRepoIntegration} from './platform/RemoteRepoIntegration'

const updatePrevUsedRepoIntegrationsCache = async (
  teamId: string,
  repoIntegrationId: string,
  viewerId: string,
  service: Integrationproviderserviceenum
) => {
  const redis = getRedis()
  const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const [prevUsedRepoIntegrations, cachedRes] = await Promise.all([
    getPrevUsedRepoIntegrations(teamId),
    redis.get(getRepoIntegrationsRedisKey(service, teamId, viewerId))
  ])
  const cachedRepoIntegrations = cachedRes ? (JSON.parse(cachedRes) as RemoteRepoIntegration[]) : []
  const remoteRepoIntegration = cachedRepoIntegrations.find(
    (repo) => IntegrationRepoId.join(repo) === repoIntegrationId
  )
  if (!remoteRepoIntegration) return
  const oldPrevUsedRepoIntegration = prevUsedRepoIntegrations?.find(
    (repo) => repo.service === service && IntegrationRepoId.join(repo) === repoIntegrationId
  )
  if (oldPrevUsedRepoIntegration) {
    await redis.zrem(prevUsedRepoIntegrationsKey, JSON.stringify(oldPrevUsedRepoIntegration))
  }
  await redis.zadd(prevUsedRepoIntegrationsKey, Date.now(), JSON.stringify(remoteRepoIntegration))
  await redis.pexpire(prevUsedRepoIntegrationsKey, ms('180d'))
}

export default updatePrevUsedRepoIntegrationsCache
