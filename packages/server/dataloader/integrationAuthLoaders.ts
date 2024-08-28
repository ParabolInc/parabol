import DataLoader from 'dataloader'
import TeamMemberIntegrationAuthId from '../../client/shared/gqlIds/TeamMemberIntegrationAuthId'
import errorFilter from '../graphql/errorFilter'
import isValid from '../graphql/isValid'
import getKysely from '../postgres/getKysely'
import {IGetBestTeamIntegrationAuthQueryResult} from '../postgres/queries/generated/getBestTeamIntegrationAuthQuery'
import {IntegrationProviderServiceEnum} from '../postgres/queries/generated/getIntegrationProvidersByIdsQuery'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import getBestTeamIntegrationAuth from '../postgres/queries/getBestTeamIntegrationAuth'
import getIntegrationProvidersByIds, {
  TIntegrationProvider
} from '../postgres/queries/getIntegrationProvidersByIds'
import getTeamMemberIntegrationAuth from '../postgres/queries/getTeamMemberIntegrationAuth'
import {selectSlackNotifications} from '../postgres/select'
import {SlackAuth, SlackNotification} from '../postgres/types'
import NullableDataLoader from './NullableDataLoader'
import RootDataLoader from './RootDataLoader'

interface TeamMemberIntegrationAuthPrimaryKey {
  service: IntegrationProviderServiceEnum
  teamId: string
  userId: string
}

interface SharedIntegrationProviderKey {
  service: IntegrationProviderServiceEnum
  /// Query with 'org' scope by orgId
  orgIds: string[]
  /// Query with 'team' scope by teamId
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
      // slightly overfetching with the services here to keep the query simple
      const services = Array.from(new Set(keys.map(({service}) => service)))
      const orgIds = Array.from(new Set(keys.flatMap(({orgIds}) => orgIds)))
      const teamIds = Array.from(new Set(keys.flatMap(({teamIds}) => teamIds)))

      const pg = getKysely()
      const results = await pg
        .selectFrom('IntegrationProvider')
        .selectAll()
        .where(({and, or, eb}) =>
          and([
            eb('service', 'in', services),
            eb('isActive', '=', true),
            or([eb('scope', '!=', 'team'), eb('teamId', 'in', [...teamIds, ''])]),
            or([eb('scope', '!=', 'org'), eb('orgId', 'in', [...orgIds, ''])])
          ])
        )
        .execute()
      return keys.map(({service, orgIds, teamIds}) =>
        results.filter(
          (row) =>
            row.service === service &&
            (row.scope === 'global' ||
              (row.scope === 'org' && row.orgId && orgIds.includes(row.orgId)) ||
              (row.scope === 'team' && row.teamId && teamIds.includes(row.teamId)))
        )
      ) as TIntegrationProvider[][]
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

interface TeamNotificationEvent {
  teamId: string
  event: SlackNotification['event']
}

export type SlackNotificationAuth = SlackNotification & {auth: SlackAuth}

export const slackNotificationsByTeamIdAndEvent = (parent: RootDataLoader) => {
  return new DataLoader<TeamNotificationEvent, SlackNotificationAuth[], string>(async (keys) => {
    const res = await selectSlackNotifications()
      .where(({eb, refTuple, tuple}) =>
        eb(
          refTuple('teamId', 'event'),
          'in',
          keys.map((key) => tuple(key.teamId, key.event))
        )
      )
      .execute()
    const userIds = [...new Set(res.map(({userId}) => userId))]
    const userSlackAuths = (await parent.get('slackAuthByUserId').loadMany(userIds))
      .filter(errorFilter)
      .flat()

    return keys.map((key) => {
      return res
        .filter((doc) => doc.teamId === key.teamId && doc.event === key.event)
        .map((notification) => {
          const auth = userSlackAuths.find(
            (auth) => auth.userId === notification.userId && auth.teamId === notification.teamId
          )
          if (!auth) return null
          return {
            ...notification,
            auth
          }
        })
        .filter(isValid)
    })
  })
}
