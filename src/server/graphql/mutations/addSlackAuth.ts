import {GraphQLID, GraphQLNonNull} from 'graphql'
import AddSlackAuthPayload from 'server/graphql/types/AddSlackAuthPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import getRethink from '../../database/rethinkDriver'
import SlackManager from '../../utils/SlackManager'
import standardError from '../../utils/standardError'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {GQLContext} from 'server/graphql/graphql'
import SlackNotification, {SlackNotificationEvent} from 'server/database/types/SlackNotification'
import SlackAuth from 'server/database/types/SlackAuth'

const upsertNotifications = async (
  viewerId: string,
  teamId: string,
  teamChannelId: string,
  botChannelId: string
) => {
  const r = getRethink()
  const existingNotifications = await r
    .table('SlackNotification')
    .getAll(viewerId, {index: 'userId'})
    .filter({teamId})
  const teamEvents = [
    'meetingStart',
    'meetingEnd',
    'meetingNextStageReady'
  ] as SlackNotificationEvent[]
  const userEvents = ['MEETING_STAGE_TIME_LIMIT'] as SlackNotificationEvent[]
  const events = [...teamEvents, ...userEvents]
  const upsertableNotifications = events.map((event) => {
    const existingNotification = existingNotifications.find(
      (notification) => notification.event === event
    )
    return new SlackNotification({
      event,
      // the existing notification channel could be a bad one (legacy reasons, bad means not public or not @Parabol)
      channelId: teamEvents.includes(event) ? teamChannelId : botChannelId,
      teamId,
      userId: viewerId,
      id: (existingNotification && existingNotification.id) || undefined
    })
  })
  await r.table('SlackNotification').insert(upsertableNotifications, {conflict: 'replace'})
}

const upsertAuth = async (
  viewerId: string,
  teamId: string,
  teamChannelId: string,
  slackUserName: string,
  slackRes: NonNullable<SlackManager['response']>
) => {
  const r = getRethink()
  const existingAuth = (await r
    .table('SlackAuth')
    .getAll(viewerId, {index: 'userId'})
    .filter({teamId})
    .nth(0)
    .default(null)) as SlackAuth | null
  const slackAuth = new SlackAuth({
    id: (existingAuth && existingAuth.id) || undefined,
    createdAt: (existingAuth && existingAuth.createdAt) || undefined,
    accessToken: slackRes.access_token,
    defaultTeamChannelId: teamChannelId,
    teamId,
    userId: viewerId,
    slackTeamId: slackRes.team_id,
    slackTeamName: slackRes.team_name,
    slackUserId: slackRes.user_id,
    slackUserName,
    botUserId: slackRes.bot.bot_user_id,
    botAccessToken: slackRes.bot.bot_access_token
  })
  await r.table('SlackAuth').insert(slackAuth, {conflict: 'replace'})
  return slackAuth.id
}

export default {
  name: 'AddSlackAuth',
  type: new GraphQLNonNull(AddSlackAuthPayload),
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {code, teamId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // RESOLUTION
    const manager = await SlackManager.init(code)
    const {response} = manager
    const slackUserId = response.user_id
    const defaultChannelId = response.incoming_webhook.channel_id
    const [convoRes, userInfoRes, botChannelRes] = await Promise.all([
      manager.getConversationInfo(defaultChannelId),
      manager.getUserInfo(slackUserId),
      manager.openIM(slackUserId)
    ])
    if (!userInfoRes.ok) {
      return standardError(new Error(userInfoRes.error), {userId: viewerId})
    }
    if (!botChannelRes.ok) {
      return standardError(new Error(botChannelRes.error), {userId: viewerId})
    }
    const {channel} = botChannelRes
    const {id: botChannelId} = channel
    // The default channel could be anything: public, private, im, mpim. Only allow public channels or the @Parabol channel
    const teamChannelId = convoRes.ok ? defaultChannelId : botChannelId

    const [, slackAuthId] = await Promise.all([
      upsertNotifications(viewerId, teamId, teamChannelId, botChannelId),
      upsertAuth(viewerId, teamId, teamChannelId, userInfoRes.user.profile.display_name, response)
    ])
    const data = {slackAuthId, userId: viewerId}
    publish(TEAM, teamId, AddSlackAuthPayload, data, subOptions)
    return data
  }
}
