import DataLoader from 'dataloader'
import RethinkDataLoader from './RethinkDataLoader'
import getIntegrationProvidersByIds, {
  IntegrationProvidersEnum,
  IntegrationProvider
} from '../postgres/queries/getIntegrationProvidersByIds'
import getIntegrationProviders from '../postgres/queries/getIntegrationProviders'
import getIntegrationTokenWithProvider from '../postgres/queries/getIntegrationTokenWithProvider'
import getIntegrationTokensByTeamWithProvider from '../postgres/queries/getIntegrationTokensByTeamWithProvider'
import {IntegrationTokenWithProvider} from '../types/IntegrationProviderAndTokenT'

interface IntegrationProviderKey {
  providerType: IntegrationProvidersEnum
  teamId: string
  orgId: string
}

interface IntegrationTokenPrimaryKey {
  providerType: IntegrationProvidersEnum
  teamId: string
  userId: string
}

export const integrationProviders = (parent: RethinkDataLoader) => {
  return new DataLoader<number, IntegrationProvider | null, string>(
    async (integrationProviderIds) => {
      const rows = await getIntegrationProvidersByIds(integrationProviderIds)
      return integrationProviderIds.map(
        (integrationProviderId) => rows.find((row) => row.id === integrationProviderId) || null
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const integrationProvidersByType = (parent: RethinkDataLoader) => {
  return new DataLoader<IntegrationProviderKey, IntegrationProvider[] | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({providerType, teamId, orgId}) =>
          getIntegrationProviders(providerType, teamId, orgId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({providerType, teamId, orgId}) => `${providerType}:${orgId}:${teamId}`
    }
  )
}

export const integrationTokenWithProvider = (parent: RethinkDataLoader) => {
  return new DataLoader<IntegrationTokenPrimaryKey, IntegrationTokenWithProvider | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({providerType, teamId, userId}) =>
          getIntegrationTokenWithProvider(providerType, teamId, userId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({providerType, teamId, userId}) => `${providerType}:${teamId}:${userId}`
    }
  )
}

export const integrationTokensByTeamWithProvider = (parent: RethinkDataLoader) => {
  return new DataLoader<
    {providerType: IntegrationProvidersEnum; teamId: string},
    IntegrationTokenWithProvider[] | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({providerType, teamId}) =>
          getIntegrationTokensByTeamWithProvider(providerType, teamId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({providerType, teamId}) => `${providerType}:${teamId}`
    }
  )
}
