import ms from 'ms'
import getConnectedTaskServices from '../../../integrations/platform/getConnectedTaskServices'
import type {Integrationproviderserviceenum} from '../../../postgres/types/pg'
import getAllRepoIntegrationsRedisKey from '../../../utils/getAllRepoIntegrationsRedisKey'
import getPrevUsedRepoIntegrationsRedisKey from '../../../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'
import logError from '../../../utils/logError'
import type {DataLoaderWorker} from '../../graphql'
import getAllCachedRepoIntegrations from './getAllCachedRepoIntegrations'
import getPrevUsedRepoIntegrations from './getPrevUsedRepoIntegrations'

const pruneRepoIntegrationsCache = async (
  dataLoader: DataLoaderWorker,
  viewerId: string,
  teamId: string,
  hasAddedIntegration: boolean
) => {
  const redis = getRedis()
  const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId, viewerId)
  if (hasAddedIntegration) {
    await redis.del(allRepoIntegrationsKey)
    return
  }
  const prevUsedIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const [allCachedRepoIntegrations, prevUsedRepoIntegrations, taskServicesWithPerms] =
    await Promise.all([
      getAllCachedRepoIntegrations(teamId, viewerId),
      getPrevUsedRepoIntegrations(teamId),
      getConnectedTaskServices({dataLoader, teamId, userId: viewerId})
    ])
  const allRepoIntServices = new Set<Integrationproviderserviceenum>()
  allCachedRepoIntegrations?.forEach(({service}) => {
    allRepoIntServices.add(service)
  })
  const cachedRepoIntWithoutPerms = [...allRepoIntServices].filter(
    (service) => !taskServicesWithPerms.includes(service)
  )
  if (allCachedRepoIntegrations && cachedRepoIntWithoutPerms.length) {
    const allRepoIntegrationsWithPerms = allCachedRepoIntegrations.filter(
      ({service}) => !cachedRepoIntWithoutPerms.includes(service)
    )
    await redis.set(
      allRepoIntegrationsKey,
      JSON.stringify(allRepoIntegrationsWithPerms),
      'PX',
      ms('90d')
    )
  }
  const staleMembers =
    prevUsedRepoIntegrations
      ?.filter(({service}) => cachedRepoIntWithoutPerms.includes(service))
      .map((repoInt) => JSON.stringify(repoInt)) ?? []
  if (staleMembers.length) {
    await redis.zrem(prevUsedIntegrationsKey, staleMembers)
  }
}

const updateRepoIntegrationsCacheByPerms = async (
  dataLoader: DataLoaderWorker,
  viewerId: string,
  teamId: string,
  hasAddedIntegration: boolean
) => {
  try {
    await pruneRepoIntegrationsCache(dataLoader, viewerId, teamId, hasAddedIntegration)
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    logError(error, {userId: viewerId, tags: {teamId}})
  }
}

export default updateRepoIntegrationsCacheByPerms
