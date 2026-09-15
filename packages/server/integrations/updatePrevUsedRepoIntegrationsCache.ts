import ms from 'ms'
import getPrevUsedRepoIntegrations from '../graphql/queries/helpers/getPrevUsedRepoIntegrations'
import type {Integrationproviderserviceenum} from '../postgres/types/pg'
import getPrevUsedRepoIntegrationsRedisKey from '../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../utils/getRedis'
import getRepoIntegrationsRedisKey from '../utils/getRepoIntegrationsRedisKey'
import {peekRedisStoreAndNetwork} from '../utils/redisStoreAndNetwork'
import getRepoListCapability from './platform/getRepoListCapability'
import type {RemoteRepoIntegration} from './platform/RemoteRepoIntegration'

const updatePrevUsedRepoIntegrationsCache = async (
  teamId: string,
  repoIntegrationId: string,
  viewerId: string,
  service: Integrationproviderserviceenum
) => {
  const redis = getRedis()
  const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const [prevUsedRepoIntegrations, cachedRepoIntegrations] = await Promise.all([
    getPrevUsedRepoIntegrations(teamId),
    peekRedisStoreAndNetwork<RemoteRepoIntegration[]>(
      getRepoIntegrationsRedisKey(service, teamId, viewerId)
    )
  ])
  const remoteRepoIntegration = cachedRepoIntegrations?.find(
    (repo) => getRepoListCapability(repo).integrationRepoId(repo) === repoIntegrationId
  )
  if (!remoteRepoIntegration) return
  const oldPrevUsedRepoIntegration = prevUsedRepoIntegrations?.find(
    (repo) =>
      repo.service === service &&
      getRepoListCapability(repo).integrationRepoId(repo) === repoIntegrationId
  )
  if (oldPrevUsedRepoIntegration) {
    await redis.zrem(prevUsedRepoIntegrationsKey, JSON.stringify(oldPrevUsedRepoIntegration))
  }
  await redis.zadd(prevUsedRepoIntegrationsKey, Date.now(), JSON.stringify(remoteRepoIntegration))
  await redis.pexpire(prevUsedRepoIntegrationsKey, ms('180d'))
}

export default updatePrevUsedRepoIntegrationsCache
