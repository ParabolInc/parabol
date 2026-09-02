import DataLoader from 'dataloader'
import type {RemoteRepoIntegration} from '../integrations/platform/RemoteRepoIntegration'
import type {Integrationproviderserviceenum} from '../postgres/types/pg'
import getRedis from '../utils/getRedis'
import getRepoIntegrationsRedisKey from '../utils/getRepoIntegrationsRedisKey'
import type RootDataLoader from './RootDataLoader'

type RepoIntegrationsCacheKey = {
  service: Integrationproviderserviceenum
  teamId: string
  userId: string
}

/** The per-service repo list cache. null = miss, [] = cached and empty */
export const cachedRepoIntegrations = (parent: RootDataLoader) =>
  new DataLoader<RepoIntegrationsCacheKey, RemoteRepoIntegration[] | null, string>(
    async (keys) => {
      const redisKeys = keys.map(({service, teamId, userId}) =>
        getRepoIntegrationsRedisKey(service, teamId, userId)
      )
      const values = await getRedis().mget(redisKeys)
      return values.map((value) => (value ? (JSON.parse(value) as RemoteRepoIntegration[]) : null))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({service, teamId, userId}) =>
        getRepoIntegrationsRedisKey(service, teamId, userId)
    }
  )
