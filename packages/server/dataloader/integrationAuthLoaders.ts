import DataLoader from 'dataloader'
import isValid from '../graphql/isValid'
import {IntegrationProviderServiceEnum} from '../postgres/queries/generated/getIntegrationProvidersByIdsQuery'
import getBestTeamIntegrationToken from '../postgres/queries/getBestTeamIntegrationToken'
import getIntegrationProvidersByIds, {
  TIntegrationProvider
} from '../postgres/queries/getIntegrationProvidersByIds'
import getIntegrationToken, {IIntegrationToken} from '../postgres/queries/getIntegrationToken'
import RootDataLoader from './RootDataLoader'

export interface IntegrationTokenPrimaryKey {
  service: IntegrationProviderServiceEnum
  teamId: string
  userId: string
}

const integrationTokenCacheKeyFn = ({service, teamId, userId}) => `${service}:${teamId}:${userId}`
export const integrationProviders = (parent: RootDataLoader) => {
  return new DataLoader<number, TIntegrationProvider | null, string>(
    async (providerIds) => {
      const integrationProviders = await getIntegrationProvidersByIds(providerIds)
      return providerIds.map(
        (providerId) => integrationProviders.find((row) => row.id === providerId) || null
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const bestTeamIntegrationProviders = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationTokenPrimaryKey, TIntegrationProvider | null, string>(
    async (keys) => {
      // given token params, get the best team token
      const bestTeamIntegrationTokens = (
        await parent.get('bestTeamIntegrationTokens').loadMany(keys)
      ).filter(isValid)
      // dedupe providerIds
      const providerIds = Array.from(
        new Set(bestTeamIntegrationTokens.map((token) => token.providerId))
      )
      // get the providers for each token
      const integrationProviders = (
        await parent.get('integrationProviders').loadMany(providerIds)
      ).filter(isValid)
      return keys.map((key) => {
        const token = bestTeamIntegrationTokens.find(
          ({service, teamId}) => service === key.service && teamId === key.teamId
        )
        if (!token) return null
        const provider = integrationProviders.find(({id}) => id === token.providerId)
        return provider ?? null
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: integrationTokenCacheKeyFn
    }
  )
}

export const integrationTokens = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationTokenPrimaryKey, IIntegrationToken | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({service, teamId, userId}) => getIntegrationToken(service, teamId, userId))
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: integrationTokenCacheKeyFn
    }
  )
}

export const bestTeamIntegrationTokens = (parent: RootDataLoader) => {
  return new DataLoader<IntegrationTokenPrimaryKey, IIntegrationToken | null, string>(
    async (keys) => {
      // TODO check the integrationTokens loader first, it probably exists there & then we don't have to hit the DB
      const results = await Promise.allSettled(
        keys.map(async ({service, teamId, userId}) =>
          getBestTeamIntegrationToken(service, teamId, userId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: integrationTokenCacheKeyFn
    }
  )
}
