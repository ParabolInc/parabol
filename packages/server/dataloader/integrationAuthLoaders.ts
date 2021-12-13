import DataLoader from 'dataloader'
import RootDataLoader from './RootDataLoader'
import getIntegrationProvidersByIds from '../postgres/queries/getIntegrationProvidersByIds'
import getIntegrationProviders from '../postgres/queries/getIntegrationProviders'
import getIntegrationTokenWithProvider from '../postgres/queries/getIntegrationTokenWithProvider'
import getIntegrationTokensByTeamWithProvider from '../postgres/queries/getIntegrationTokensByTeamWithProvider'
import {
  IntegrationProvider,
  IntegrationProviderTypesEnum,
  IntegrationTokenWithProvider
} from '../postgres/types/IIntegrationProviderAndToken'

export interface IntegrationProviderTeamKey {
  type: IntegrationProviderTypesEnum
  teamId: string
}

export interface IntegrationProviderKey {
  type: IntegrationProviderTypesEnum
  teamId: string
  orgId: string
}

export interface IntegrationTokenPrimaryKey {
  type: IntegrationProviderTypesEnum
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
  return new DataLoader<IntegrationProviderKey, IntegrationProvider[] | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({type, teamId, orgId}) => getIntegrationProviders(type, teamId, orgId))
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({type, teamId, orgId}) => `${type}:${orgId}:${teamId}`
    }
  )
}

export const integrationTokenWithProvider = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationTokenPrimaryKey, IntegrationTokenWithProvider | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({type, teamId, userId}) =>
          getIntegrationTokenWithProvider(type, teamId, userId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({type, teamId, userId}) => `${type}:${teamId}:${userId}`
    }
  )
}

export const integrationTokensByTeamWithProvider = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationProviderTeamKey, IntegrationTokenWithProvider[] | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({type, teamId}) => getIntegrationTokensByTeamWithProvider(type, teamId))
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({type, teamId}) => `${type}:${teamId}`
    }
  )
}
