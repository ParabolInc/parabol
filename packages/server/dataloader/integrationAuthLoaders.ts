import DataLoader from 'dataloader'
import {IntegrationProviderServiceEnum} from '../postgres/queries/generated/getIntegrationProvidersByIdsQuery'
import {IGetIntegrationTokenQueryResult} from '../postgres/queries/generated/getIntegrationTokenQuery'
import getIntegrationProvidersByIds, {
  TIntegrationProvider
} from '../postgres/queries/getIntegrationProvidersByIds'
import getIntegrationToken from '../postgres/queries/getIntegrationToken'
import RootDataLoader from './RootDataLoader'

export interface IntegrationProviderTeamKey {
  provider: IntegrationProviderServiceEnum
  teamId: string
}

export interface IntegrationProviderTeamOrgKey {
  provider: IntegrationProviderServiceEnum
  teamId: string
  orgId: string
}

export interface IntegrationTokenPrimaryKey {
  provider: IntegrationProviderServiceEnum
  teamId: string
  userId: string
}

export const integrationProviders = (parent: RootDataLoader) => {
  return new DataLoader<number, TIntegrationProvider | null, string>(
    async (providerIds) => {
      const rows = await getIntegrationProvidersByIds(providerIds)
      return providerIds.map((providerId) => rows.find((row) => row.id === providerId) || null)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const integrationToken = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationTokenPrimaryKey, IGetIntegrationTokenQueryResult | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({provider, teamId, userId}) =>
          getIntegrationToken(provider, teamId, userId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({provider, teamId, userId}) => `${provider}:${teamId}:${userId}`
    }
  )
}
