import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import SlackServerManager from '../../../utils/SlackServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'
import {slackNotificationEventTypeLookup} from '../types/SlackNotification'

export const upsertNotifications = async (
  viewerId: string,
  teamId: string,
  teamChannelId: string,
  channelId: string
) => {
  const pg = getKysely()
  const upsertableNotifications = Object.keys(slackNotificationEventTypeLookup).map((event) => {
    const type =
      slackNotificationEventTypeLookup[event as keyof typeof slackNotificationEventTypeLookup]
    return {
      id: generateUID(),
      event: event as keyof typeof slackNotificationEventTypeLookup,
      teamId,
      userId: viewerId,
      channelId: type === 'team' ? teamChannelId : channelId
    }
  })
  await pg
    .insertInto('SlackNotification')
    .values(upsertableNotifications)
    .onConflict((oc) =>
      oc.columns(['teamId', 'userId', 'event']).doUpdateSet((eb) => ({
        channelId: eb.ref('excluded.channelId')
      }))
    )
    .execute()
}

const upsertAuth = async (
  viewerId: string,
  teamId: string,
  teamChannelId: string,
  slackUserName: string,
  slackRes: NonNullable<SlackServerManager['response']>
) => {
  const pg = getKysely()
  const res = await pg
    .insertInto('SlackAuth')
    .values({
      id: generateUID(),
      defaultTeamChannelId: teamChannelId,
      teamId,
      userId: viewerId,
      slackTeamId: slackRes.team.id,
      slackTeamName: slackRes.team.name,
      slackUserId: slackRes.authed_user.id,
      slackUserName,
      botUserId: slackRes.bot_user_id,
      botAccessToken: slackRes.access_token
    })
    .onConflict((oc) =>
      oc.columns(['teamId', 'userId']).doUpdateSet((eb) => ({
        isActive: true,
        defaultTeamChannelId: eb.ref('excluded.defaultTeamChannelId'),
        slackTeamId: eb.ref('excluded.slackTeamId'),
        slackTeamName: eb.ref('excluded.slackTeamName'),
        slackUserId: eb.ref('excluded.slackUserId'),
        slackUserName: eb.ref('excluded.slackUserName'),
        botUserId: eb.ref('excluded.botUserId'),
        botAccessToken: eb.ref('excluded.botAccessToken')
      }))
    )
    .returning('id')
    .executeTakeFirstOrThrow()

  return res.id
}

const addSlackAuth: MutationResolvers['addSlackAuth'] = async (
  _source,
  {code, teamId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
  }

  // RESOLUTION
  const manager = await SlackServerManager.init(code)
  const {response} = manager
  const slackUserId = response.authed_user.id
  const defaultChannelId = response.incoming_webhook.channel_id
  const [joinConvoRes, userInfoRes, viewer] = await Promise.all([
    manager.joinConversation(defaultChannelId),
    manager.getUserInfo(slackUserId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!userInfoRes.ok) {
    return standardError(new Error(userInfoRes.error), {userId: viewerId})
  }

  // The default channel could be anything: public, private, im, mpim. Only allow public channels or the @Parabol channel
  // Using the slackUserId sends a DM to the user from @Parabol
  const teamChannelId = joinConvoRes.ok ? joinConvoRes.channel.id : slackUserId

  const [, slackAuthId] = await Promise.all([
    upsertNotifications(viewerId, teamId, teamChannelId, defaultChannelId),
    upsertAuth(viewerId, teamId, teamChannelId, userInfoRes.user.profile.display_name, response)
  ])
  analytics.integrationAdded(viewer, teamId, 'slack')
  const data = {slackAuthId, userId: viewerId}
  publish(SubscriptionChannel.TEAM, teamId, 'AddSlackAuthPayload', data, subOptions)
  return data
}

export default addSlackAuth
