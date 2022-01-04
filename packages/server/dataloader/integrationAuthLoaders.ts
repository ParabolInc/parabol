import DataLoader from 'dataloader'
import getIntegrationProvidersByIds from '../postgres/queries/getIntegrationProvidersByIds'
import getIntegrationTokenWithProvider from '../postgres/queries/getIntegrationToken'
import {IntegrationProvider, IntegrationProvidersEnum} from '../postgres/types/IntegrationProvider'
import {IntegrationTokenWithProvider} from '../postgres/types/IntegrationTokenWithProvider'
import RootDataLoader from './RootDataLoader'

export interface IntegrationProviderTeamKey {
  provider: IntegrationProvidersEnum
  teamId: string
}

export interface IntegrationProviderTeamOrgKey {
  provider: IntegrationProvidersEnum
  teamId: string
  orgId: string
}

export interface IntegrationTokenPrimaryKey {
  provider: IntegrationProvidersEnum
  teamId: string
  userId: string
}

export const integrationProviders = (parent: RootDataLoader) => {
  return new DataLoader<number, IntegrationProvider | null, string>(
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
  return new DataLoader<IntegrationTokenPrimaryKey, IntegrationTokenWithProvider | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({provider, teamId, userId}) =>
          getIntegrationTokenWithProvider(provider, teamId, userId)
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
