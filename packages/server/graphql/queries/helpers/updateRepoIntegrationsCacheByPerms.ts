import ms from 'ms'
import getAllRepoIntegrationsRedisKey from '../../../utils/getAllRepoIntegrationsRedisKey'
import getPrevUsedRepoIntegrationsRedisKey from '../../../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'
import getTaskServicesWithPerms from '../../../utils/getTaskServicesWithPerms'
import {DataLoaderWorker} from '../../graphql'
import {IntegrationProviderServiceEnumType} from '../../types/IntegrationProviderServiceEnum'
import getAllCachedRepoIntegrations from './getAllCachedRepoIntegrations'
import getPrevUsedRepoIntegrations from './getPrevUsedRepoIntegrations'

const updateRepoIntegrationsCacheByPerms = async (
  dataLoader: DataLoaderWorker,
  viewerId: string,
  teamId: string,
  hasAddedIntegration: boolean
) => {
  const redis = getRedis()
  const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId, viewerId)
  if (hasAddedIntegration) {
    // clear allRepos cache so we can fetch from network
    await redis.del(allRepoIntegrationsKey)
    return
  }
  const prevUsedIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const [allCachedRepoIntegrations, prevUsedRepoIntegrations, taskServicesWithPerms] =
    await Promise.all([
      getAllCachedRepoIntegrations(teamId, viewerId),
      getPrevUsedRepoIntegrations(teamId),
      getTaskServicesWithPerms(dataLoader, teamId, viewerId)
    ])
  const allRepoIntServices = new Set<IntegrationProviderServiceEnumType>()
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
  if (prevUsedRepoIntegrations) {
    const prevUsedRepoIntsWithoutPerms = prevUsedRepoIntegrations.filter(({service}) =>
      cachedRepoIntWithoutPerms.includes(service)
    )
    await Promise.all(
      prevUsedRepoIntsWithoutPerms.map((repoInt) => {
        redis.zrem(prevUsedIntegrationsKey, JSON.stringify(repoInt))
      })
    )
  }
}

export default updateRepoIntegrationsCacheByPerms
