import {GraphQLList, GraphQLID, GraphQLNonNull} from 'graphql'
import SetSlackNotificationPayload from 'server/graphql/types/SetSlackNotificationPayload'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import getRethink from '../../database/rethinkDriver'
import SlackManager from '../../utils/SlackManager'
import standardError from '../../utils/standardError'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {GQLContext} from 'server/graphql/graphql'
import SlackNotification from 'server/database/types/SlackNotification'
import SlackNotificationEventEnum from 'server/graphql/types/SlackNotificationEventEnum'
import {ISetSlackNotificationOnMutationArguments} from 'universal/types/graphql'

export default {
  name: 'SetSlackNotification',
  type: new GraphQLNonNull(SetSlackNotificationPayload),
  args: {
    slackChannelId: {
      type: GraphQLID
    },
    slackNotificationEvents: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SlackNotificationEventEnum)))
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {slackChannelId, slackNotificationEvents, teamId}: ISetSlackNotificationOnMutationArguments,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const r = getRethink()

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // VALIDATION
    const slackAuths = await dataLoader.get('slackAuthByUserId').load(viewerId)
    const slackAuth = slackAuths.find((auth) => auth.teamId === teamId)

    if (!slackAuth) {
      return standardError(new Error('Slack authentication not found'), {userId: viewerId})
    }

    if (slackChannelId) {
      // use accessToken as a fallback for folks who haven't refreshed their auth lately
      const manager = new SlackManager(slackAuth.botAccessToken || slackAuth.accessToken)
      const channelInfo = await manager.getConversationInfo(slackChannelId)

      if (!channelInfo.ok) {
        return standardError(new Error(channelInfo.error), {userId: viewerId})
      }
      const {channel} = channelInfo
      const {is_archived: isArchived} = channel
      if (isArchived) return standardError(new Error('Slack channel archived'), {userId: viewerId})
    }

    // RESOLUTION
    const existingNotifications = await r
      .table('SlackNotification')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId})
      .filter((row) => r(slackNotificationEvents).contains(row('event')))

    const notifications = slackNotificationEvents.map((event) => {
      const existingNotification = existingNotifications.find(
        (notification) => notification.event === event
      )
      return new SlackNotification({
        event,
        channelId: slackChannelId,
        teamId,
        userId: viewerId,
        id: (existingNotification && existingNotification.id) || undefined
      })
    })
    await r.table('SlackNotification').insert(notifications, {conflict: 'replace'})
    const slackNotificationIds = notifications.map(({id}) => id)
    const data = {userId: viewerId, slackNotificationIds}
    publish(TEAM, teamId, SetSlackNotificationPayload, data, subOptions)
    return data
  }
}
