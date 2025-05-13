import DataLoader from 'dataloader'
import {Selectable, sql} from 'kysely'
import errorFilter from '../graphql/errorFilter'
import isValid from '../graphql/isValid'
import getKysely from '../postgres/getKysely'
import {IntegrationProviderServiceEnum} from '../postgres/queries/generated/getIntegrationProvidersByIdsQuery'
import getIntegrationProvidersByIds, {
  TIntegrationProvider
} from '../postgres/queries/getIntegrationProvidersByIds'
import {selectSlackNotifications, selectTeamMemberIntegrationAuth} from '../postgres/select'
import {SlackAuth, SlackNotification, TeamMemberIntegrationAuth} from '../postgres/types'
import {TeamNotificationSettings} from '../postgres/types/pg'
import NullableDataLoader from './NullableDataLoader'
import RootDataLoader, {RegisterDependsOn} from './RootDataLoader'

interface TeamMemberIntegrationAuthServiceTeamUserKey {
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
}: TeamMemberIntegrationAuthServiceTeamUserKey) => `${service}-${teamId}-${userId}`

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
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({service, orgIds, teamIds}) =>
        `${service}-${orgIds.toSorted().join(',')}-${teamIds.toSorted().join(',')}`
    }
  )
}

export const teamMemberIntegrationAuthsByServiceTeamAndUserId = (parent: RootDataLoader) => {
  return new DataLoader<
    TeamMemberIntegrationAuthServiceTeamUserKey,
    TeamMemberIntegrationAuth | null,
    string
  >(
    async (keys) => {
      const results = await selectTeamMemberIntegrationAuth()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('teamId', 'userId', 'service'),
            'in',
            keys.map((key) => tuple(key.teamId, key.userId, key.service))
          )
        )
        .where('isActive', '=', true)
        .execute()
      return keys.map(
        (key) =>
          results.find(
            ({teamId, userId, service}) =>
              key.teamId === teamId && key.userId === userId && key.service === service
          ) || null
      )
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
      const usedChannelIds = new Set<string>()
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
        .filter(({channelId}) => {
          if (!channelId || usedChannelIds.has(channelId)) return false
          usedChannelIds.add(channelId)
          return true
        })
    })
  })
}

export const teamMemberIntegrationAuthsByTeamIdAndService = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; service: IntegrationProviderServiceEnum},
    TeamMemberIntegrationAuth[],
    string
  >(
    async (keys) => {
      const pg = getKysely()
      const res = (await pg
        .selectFrom('TeamMemberIntegrationAuth')
        .selectAll()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('teamId', 'service'),
            'in',
            keys.map(({teamId, service}) => tuple(teamId, service))
          )
        )
        .where('isActive', '=', true)
        .execute()) as unknown as TeamMemberIntegrationAuth[]

      return keys.map((key) =>
        res.filter(({teamId, service}) => teamId === key.teamId && service === key.service)
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, service}) => `${teamId}-${service}`
    }
  )
}

export const teamNotificationSettingsByProviderIdAndTeamId = (
  parent: RootDataLoader,
  dependsOn: RegisterDependsOn
) => {
  dependsOn('teamNotificationSettings')
  return new DataLoader<
    {providerId: number; teamId: string},
    Selectable<TeamNotificationSettings>[],
    string
  >(
    async (keys) => {
      const pg = getKysely()
      const res = await pg
        .selectFrom('TeamNotificationSettings')
        .selectAll()
        // convert to text[] as kysely would otherwise not parse the array
        .select(sql<TeamNotificationSettings['events']>`events::text[]`.as('events'))
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('providerId', 'teamId'),
            'in',
            keys.map(({providerId, teamId}) => tuple(providerId, teamId))
          )
        )
        .execute()

      return keys.map((key) =>
        res.filter(({providerId, teamId}) => providerId === key.providerId && teamId === key.teamId)
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({providerId, teamId}) => `${providerId}-${teamId}`
    }
  )
}
