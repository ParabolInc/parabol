import DataLoader from 'dataloader'
import {sql} from 'kysely'
import {selectIntegrationSearchQuery} from '../postgres/select'
import type {IntegrationSearchQuery} from '../postgres/types'
import type RootDataLoader from './RootDataLoader'

type RecentSearchQueryKey = {
  teamId: string
  userId: string
  providerId: number
}

export const recentIntegrationSearchQueries = (parent: RootDataLoader) => {
  return new DataLoader<RecentSearchQueryKey, IntegrationSearchQuery[], string>(
    async (keys) => {
      return Promise.all(
        keys.map(({teamId, userId, providerId}) =>
          selectIntegrationSearchQuery()
            .where('teamId', '=', teamId)
            .where('userId', '=', userId)
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
      cacheKeyFn: ({teamId, userId, providerId}) => `${teamId}:${userId}:${providerId}`
    }
  )
}
