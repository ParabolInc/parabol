import DataLoader from 'dataloader'
import RethinkDataLoader from './RethinkDataLoader'
import getIntegrationProvidersByIds, {
  IntegrationProviderTypesEnum,
  IntegrationProvider
} from '../postgres/queries/getIntegrationProvidersByIds'
import getIntegrationProviders from '../postgres/queries/getIntegrationProviders'
import getIntegrationTokenWithProvider from '../postgres/queries/getIntegrationTokenWithProvider'
import getIntegrationTokensByTeamWithProvider from '../postgres/queries/getIntegrationTokensByTeamWithProvider'
import {IntegrationTokenWithProvider} from '../types/IntegrationProviderAndTokenT'

interface IntegrationProviderKey {
  type: IntegrationProviderTypesEnum
  teamId: string
  orgId: string
}

interface IntegrationTokenPrimaryKey {
  type: IntegrationProviderTypesEnum
  teamId: string
  userId: string
}

export const integrationProviders = (parent: RethinkDataLoader) => {
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

export const integrationProvidersByType = (parent: RethinkDataLoader) => {
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

export const integrationTokenWithProvider = (parent: RethinkDataLoader) => {
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

export const integrationTokensByTeamWithProvider = (parent: RethinkDataLoader) => {
  return new DataLoader<
    {type: IntegrationProviderTypesEnum; teamId: string},
    IntegrationTokenWithProvider[] | null,
    string
  >(
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
