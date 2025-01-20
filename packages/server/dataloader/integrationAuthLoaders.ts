import DataLoader from 'dataloader'
import errorFilter from '../graphql/errorFilter'
import isValid from '../graphql/isValid'
import getKysely from '../postgres/getKysely'
import {IntegrationProviderServiceEnum} from '../postgres/queries/generated/getIntegrationProvidersByIdsQuery'
import getIntegrationProvidersByIds, {
  TIntegrationProvider
} from '../postgres/queries/getIntegrationProvidersByIds'
import {selectSlackNotifications, selectTeamMemberIntegrationAuth} from '../postgres/select'
import {SlackAuth, SlackNotification, TeamMemberIntegrationAuth} from '../postgres/types'
import {NotificationSettings} from '../postgres/types/pg'
import NullableDataLoader from './NullableDataLoader'
import RootDataLoader from './RootDataLoader'

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

export const teamMemberIntegrationAuthsByTeamIdAndEvent = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; service: IntegrationProviderServiceEnum; event: SlackNotification['event']},
    TeamMemberIntegrationAuth[],
    string
  >(
    async (keys) => {
      const pg = getKysely()
      const res = (await pg
        .selectFrom('TeamMemberIntegrationAuth')
        .innerJoin('NotificationSettings', 'authId', 'TeamMemberIntegrationAuth.id')
        .selectAll()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('teamId', 'service', 'event'),
            'in',
            keys.map(({teamId, service, event}) => tuple(teamId, service, event))
          )
        )
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

export const notificationSettingsByAuthId = (parent: RootDataLoader) => {
  return new DataLoader<number, NotificationSettings['event'][], string>(
    async (keys) => {
      const pg = getKysely()
      const res = await pg
        .selectFrom('NotificationSettings')
        .selectAll()
        .where(({eb}) => eb('authId', 'in', keys))
        .execute()

      return keys.map((key) => res.filter(({authId}) => authId === key).map(({event}) => event))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
