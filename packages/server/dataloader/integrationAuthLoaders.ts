import DataLoader from 'dataloader'
import RootDataLoader from './RootDataLoader'
import getIntegrationProvidersByIds from '../postgres/queries/getIntegrationProvidersByIds'
import getIntegrationProviders from '../postgres/queries/getIntegrationProviders'
import getIntegrationTokenWithProvider from '../postgres/queries/getIntegrationTokenWithProvider'
import getIntegrationTokensByTeamWithProvider from '../postgres/queries/getIntegrationTokensByTeamWithProvider'
import {IntegrationProvider, IntegrationProvidersEnum} from '../postgres/types/IntegrationProvider'
import {IntegrationTokenWithProvider} from '../postgres/types/IntegrationTokenWithProvider'

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

export const integrationProvidersByType = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationProviderTeamOrgKey, IntegrationProvider[] | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({provider, teamId, orgId}) =>
          getIntegrationProviders(provider, teamId, orgId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({provider, teamId, orgId}) => `${provider}:${orgId}:${teamId}`
    }
  )
}

export const integrationTokenWithProvider = (parent: RootDataLoader) => {
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

export const integrationTokensByTeamWithProvider = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationProviderTeamKey, IntegrationTokenWithProvider[] | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({provider, teamId}) =>
          getIntegrationTokensByTeamWithProvider(provider, teamId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({provider, teamId}) => `${provider}:${teamId}`
    }
  )
}
