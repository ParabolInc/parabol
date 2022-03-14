import DataLoader from 'dataloader'
import SlackNotification, {SlackNotificationEvent} from '../database/types/SlackNotification'
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
import errorFilter from '../graphql/errorFilter'
import getRethink from '../database/rethinkDriver'
import SlackAuth from '../database/types/SlackAuth'

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

interface TeamNotificationEvent {
  teamId: string
  event: SlackNotificationEvent
}

export type SlackNotificationAuth = SlackNotification & {auth: SlackAuth}

export const slackNotificationsByTeamIdAndEvent = (parent: RootDataLoader) => {
  return new DataLoader<TeamNotificationEvent, SlackNotificationAuth[], string>(async (keys) => {
    const r = await getRethink()
    const notifications = await r
      .expr(keys)
      .concatMap((key) =>
        r
          .table('SlackNotification')
          .getAll(key('teamId'), {index: 'teamId'})
          .filter({event: key('event')})
      )
      .coerceTo('array')
      .run()

    const distinctChannelNotifications = keys.map((key) => {
      const usedChannelIds = new Set()
      return notifications.filter((notification) => {
        const {teamId, event, channelId} = notification
        if (teamId !== key.teamId || event !== key.event) return false
        if (!channelId || usedChannelIds.has(channelId)) return false
        usedChannelIds.add(channelId)
        return true
      })
    })
    const notificationUserIds = distinctChannelNotifications.flatMap((not) =>
      not.map(({userId}) => userId)
    )
    const userSlackAuths = (await parent.get('slackAuthByUserId').loadMany(notificationUserIds))
      .filter(errorFilter)
      .flat()

    return distinctChannelNotifications.map(
      (notifications) =>
        notifications
          .map((notification) => ({
            ...notification,
            auth: userSlackAuths.find(
              ({userId, teamId}) => userId === notification.userId && teamId === notification.teamId
            )
          }))
          .filter(({auth}) => !!auth) as SlackNotificationAuth[]
    )
  })
}
