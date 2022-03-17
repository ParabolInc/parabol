import DataLoader from 'dataloader'
import TeamMemberIntegrationAuthId from '../../client/shared/gqlIds/TeamMemberIntegrationAuthId'
import isValid from '../graphql/isValid'
import {IGetBestTeamIntegrationAuthQueryResult} from '../postgres/queries/generated/getBestTeamIntegrationAuthQuery'
import {IntegrationProviderServiceEnum} from '../postgres/queries/generated/getIntegrationProvidersByIdsQuery'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import getBestTeamIntegrationAuth from '../postgres/queries/getBestTeamIntegrationAuth'
import getIntegrationProvidersByIds, {
  TIntegrationProvider
} from '../postgres/queries/getIntegrationProvidersByIds'
import getSharedIntegrationProviders from '../postgres/queries/getSharedIntegrationProviders'
import getTeamMemberIntegrationAuth from '../postgres/queries/getTeamMemberIntegrationAuth'
import NullableDataLoader from './NullableDataLoader'
import RootDataLoader from './RootDataLoader'

interface TeamMemberIntegrationAuthPrimaryKey {
  service: IntegrationProviderServiceEnum
  teamId: string
  userId: string
}

interface SharedIntegrationProviderKey {
  service: IntegrationProviderServiceEnum
  /// All team ids belonging to the organization, used for scope === 'org'
  orgTeamIds: string[]
  teamIds: string[]
}

const teamMemberIntegrationAuthCacheKeyFn = ({
  service,
  teamId,
  userId
}: TeamMemberIntegrationAuthPrimaryKey) => TeamMemberIntegrationAuthId.join(service, teamId, userId)

export const integrationProviders = (parent: RootDataLoader) => {
  return new NullableDataLoader<number, TIntegrationProvider, string>(
    async (providerIds) => {
      const integrationProviders = await getIntegrationProvidersByIds(providerIds)
      return providerIds.map((providerId) =>
        integrationProviders.find((row) => row.id === providerId)
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const sharedIntegrationProviders = (parent: RootDataLoader) => {
  return new DataLoader<SharedIntegrationProviderKey, TIntegrationProvider[], string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({service, orgTeamIds, teamIds}) =>
          getSharedIntegrationProviders(service, orgTeamIds, teamIds)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : []))
      return vals
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const bestTeamIntegrationProviders = (parent: RootDataLoader) => {
  return new DataLoader<TeamMemberIntegrationAuthPrimaryKey, TIntegrationProvider | null, string>(
    async (keys) => {
      // given token params, get the best team token
      const bestTeamIntegrationAuths = (
        await parent.get('bestTeamIntegrationAuths').loadMany(keys)
      ).filter(isValid)
      // dedupe providerIds
      const providerIds = Array.from(
        new Set(bestTeamIntegrationAuths.map((token) => token.providerId))
      )
      // get the providers for each token
      const integrationProviders = (
        await parent.get('integrationProviders').loadMany(providerIds)
      ).filter(isValid)
      return keys.map((key) => {
        const token = bestTeamIntegrationAuths.find(
          ({service, teamId}) => service === key.service && teamId === key.teamId
        )
        if (!token) return null
        const provider = integrationProviders.find(({id}) => id === token.providerId)
        return provider ?? null
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: teamMemberIntegrationAuthCacheKeyFn
    }
  )
}

export const teamMemberIntegrationAuths = (parent: RootDataLoader) => {
  return new DataLoader<
    TeamMemberIntegrationAuthPrimaryKey,
    IGetTeamMemberIntegrationAuthQueryResult | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({service, teamId, userId}) =>
          getTeamMemberIntegrationAuth(service, teamId, userId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: teamMemberIntegrationAuthCacheKeyFn
    }
  )
}

export const bestTeamIntegrationAuths = (parent: RootDataLoader) => {
  return new DataLoader<
    TeamMemberIntegrationAuthPrimaryKey,
    IGetBestTeamIntegrationAuthQueryResult | null,
    string
  >(
    async (keys) => {
      // TODO check the teamMemberIntegrationAuths loader first, it probably exists there & then we don't have to hit the DB
      const results = await Promise.allSettled(
        keys.map(async ({service, teamId, userId}) =>
          getBestTeamIntegrationAuth(service, teamId, userId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: teamMemberIntegrationAuthCacheKeyFn
    }
  )
}
