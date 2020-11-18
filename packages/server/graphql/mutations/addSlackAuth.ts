import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import SlackAuth from '../../database/types/SlackAuth'
import SlackNotification, {SlackNotificationEvent} from '../../database/types/SlackNotification'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import SlackServerManager from '../../utils/SlackServerManager'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddSlackAuthPayload from '../types/AddSlackAuthPayload'

const upsertNotifications = async (
  viewerId: string,
  teamId: string,
  teamChannelId: string,
  channelId: string
  ) => {
    console.log("ADD SLACK AUTH", viewerId, teamId)
  const r = await getRethink()
  const existingNotifications = await r
    .table('SlackNotification')
    .getAll(viewerId, {index: 'userId'})
    .filter({teamId})
    .run()
  const teamEvents = [
    'meetingStart',
    'meetingEnd',
    'MEETING_STAGE_TIME_LIMIT_START'
  ] as SlackNotificationEvent[]
  const userEvents = ['MEETING_STAGE_TIME_LIMIT_END'] as SlackNotificationEvent[]
  const events = [...teamEvents, ...userEvents]
  const upsertableNotifications = events.map((event) => {
    const existingNotification = existingNotifications.find(
      (notification) => notification.event === event
    )
    return new SlackNotification({
      event,
      // the existing notification channel could be a bad one (legacy reasons, bad means not public or not @Parabol)
      channelId: teamEvents.includes(event) ? teamChannelId : channelId,
      teamId,
      userId: viewerId,
      id: (existingNotification && existingNotification.id) || undefined
    })
  })
  console.log("upsertableNotifications", upsertableNotifications)
  await r
    .table('SlackNotification')
    .insert(upsertableNotifications, {conflict: 'replace'})
    .run()
}

const upsertAuth = async (
  viewerId: string,
  teamId: string,
  teamChannelId: string,
  slackUserName: string,
  slackRes: NonNullable<SlackServerManager['response']>
) => {
  const r = await getRethink()
  const existingAuth = (await r
    .table('SlackAuth')
    .getAll(viewerId, {index: 'userId'})
    .filter({teamId})
    .nth(0)
    .default(null)
    .run()) as SlackAuth | null
    console.log("slackRes <><><><>", slackRes)

  const slackAuth = new SlackAuth({
    id: (existingAuth && existingAuth.id) || undefined,
    createdAt: (existingAuth && existingAuth.createdAt) || undefined,
    accessToken: slackRes.access_token,
    defaultTeamChannelId: teamChannelId,
    teamId,
    userId: viewerId,
    slackTeamId: slackRes.team.id,
    slackTeamName: slackRes.team.name,
    slackUserId: slackRes.authed_user.id,
    slackUserName,
    botUserId: slackRes.bot_user_id,
    botAccessToken: slackRes.access_token // TODO
  })
  await r
    .table('SlackAuth')
    .insert(slackAuth, {conflict: 'replace'})
    .run()
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
    const manager = await SlackServerManager.init(code)
    const {response} = manager
    console.log("response", response)
    // const slackUserId = response.user_id
    const slackUserId = response.authed_user.id
    console.log("slackUserId", slackUserId)
    const defaultChannelId = response.incoming_webhook.channel_id
    console.log("defaultChannelId", defaultChannelId)
    // const [convoRes, userInfoRes, channelRes] = await Promise.all([
    //   manager.getConversationInfo(defaultChannelId),
    //   manager.getUserInfo(slackUserId),
    //   manager.openConversation()
    // ])
    const [convoRes, userInfoRes, ] = await Promise.all([
      manager.getConversationInfo(defaultChannelId),
      manager.getUserInfo(slackUserId),
    ])
    // console.log("convoRes", convoRes)
    // console.log("userInfoRes", userInfoRes)
    // console.log("channelRes", channelRes)
    if (!userInfoRes.ok) {
      return standardError(new Error(userInfoRes.error), {userId: viewerId})
    }
    // if (!channelRes.ok) {
    //   return standardError(new Error(channelRes.error), {userId: viewerId})
    // }
    // const {channel} = channelRes
    // const {id: channelId} = channel

    // The default channel could be anything: public, private, im, mpim. Only allow public channels or the @Parabol channel
    // const teamChannelId = convoRes.ok ? defaultChannelId : channelId
    const teamChannelId = convoRes.ok ? defaultChannelId : defaultChannelId
    console.log("teamChannelId", teamChannelId)

    const [, slackAuthId] = await Promise.all([
      upsertNotifications(viewerId, teamId, teamChannelId, defaultChannelId),
      upsertAuth(viewerId, teamId, teamChannelId, userInfoRes.user.profile.display_name, response)
    ])
    console.log("slackAuthId", slackAuthId)
    segmentIo.track({
      userId: viewerId,
      event: 'Added Integration',
      properties: {
        teamId,
        service: 'Slack'
      }
    })
    const data = {slackAuthId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddSlackAuthPayload', data, subOptions)
    return data
  }
}
