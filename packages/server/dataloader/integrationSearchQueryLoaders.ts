import DataLoader from 'dataloader'
import {sql} from 'kysely'
import {selectIntegrationSearchQuery} from '../postgres/select'
import type {IntegrationSearchQuery} from '../postgres/types'
import type {Integrationproviderserviceenum} from '../postgres/types/pg'
import type RootDataLoader from './RootDataLoader'

type RecentSearchQueryKey = {
  teamId: string
  userId: string
  service: Integrationproviderserviceenum
  providerId: number
}

export const recentIntegrationSearchQueries = (parent: RootDataLoader) => {
  return new DataLoader<RecentSearchQueryKey, IntegrationSearchQuery[], string>(
    async (keys) => {
      return Promise.all(
        keys.map(({teamId, userId, service, providerId}) =>
          selectIntegrationSearchQuery()
            .where('teamId', '=', teamId)
            .where('userId', '=', userId)
            .where('service', '=', service)
            .where('providerId', '=', providerId)
            .where('lastUsedAt', '>', sql<Date>`NOW() - INTERVAL '60 days'`)
            .orderBy('lastUsedAt', 'desc')
            .limit(5)
            .execute()
        )
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId, service, providerId}) =>
        `${teamId}:${userId}:${service}:${providerId}`
    }
  )
}
