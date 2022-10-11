import ms from 'ms'
import getAllRepoIntegrationsRedisKey from '../../../utils/getAllRepoIntegrationsRedisKey'
import getPrevUsedRepoIntegrationsRedisKey from '../../../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'
import {IntegrationProviderServiceEnumType} from '../../types/IntegrationProviderServiceEnum'
import {RemoteRepoIntegration} from './fetchAllRepoIntegrations'

const updateRepoIntegrationsCacheByPerms = async (
  allCachedRepoIntegrations: RemoteRepoIntegration[] | null,
  prevUsedRepoIntegrations: RemoteRepoIntegration[] | null,
  taskServicesWithPerms: IntegrationProviderServiceEnumType[],
  teamId: string
) => {
  if (!allCachedRepoIntegrations) return [null, prevUsedRepoIntegrations]
  const redis = getRedis()
  const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId)
  const prevUsedIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
  const allRepoIntServices = new Set<IntegrationProviderServiceEnumType>()
  allCachedRepoIntegrations.forEach(({service}) => {
    allRepoIntServices.add(service)
  })
  const missingServices = taskServicesWithPerms.filter(
    (service) => ![...allRepoIntServices].includes(service)
  )
  const cachedRepoIntWithoutPerms = [...allRepoIntServices].filter(
    (service) => !taskServicesWithPerms.includes(service)
  )
  if (missingServices.length) {
    // user has added a new integration(s) since we last updated the cache. Clear allRepos cache so we can fetch from network
    await redis.del(allRepoIntegrationsKey)
    return [[], prevUsedRepoIntegrations]
  } else if (cachedRepoIntWithoutPerms.length) {
    // user has removed an integration(s) since we last updated the cache. Filter service(s) from both caches
    const allRepoIntegrationsWithPerms = allCachedRepoIntegrations.filter(
      ({service}) => !cachedRepoIntWithoutPerms.includes(service)
    )
    await redis.set(
      allRepoIntegrationsKey,
      JSON.stringify(allRepoIntegrationsWithPerms),
      'PX',
      ms('90d')
    )
    const prevUsedRepoIntsWithoutPerms = prevUsedRepoIntegrations?.filter(({service}) =>
      cachedRepoIntWithoutPerms.includes(service)
    )
    if (!prevUsedRepoIntsWithoutPerms) {
      return [allRepoIntegrationsWithPerms, prevUsedRepoIntegrations]
    }
    await Promise.all(
      prevUsedRepoIntsWithoutPerms.map((repoInt) => {
        redis.zrem(prevUsedIntegrationsKey, JSON.stringify(repoInt))
      })
    )
    const prevUsedRepoIntsWithPerms =
      prevUsedRepoIntegrations?.filter(
        ({service}) => !cachedRepoIntWithoutPerms.includes(service)
      ) ?? []
    return [allRepoIntegrationsWithPerms, prevUsedRepoIntsWithPerms]
  }
  return [allCachedRepoIntegrations, prevUsedRepoIntegrations] as const
}

export default updateRepoIntegrationsCacheByPerms
