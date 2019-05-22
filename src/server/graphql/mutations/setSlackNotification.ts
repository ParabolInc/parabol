import {GraphQLID, GraphQLNonNull} from 'graphql'
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

export default {
  name: 'SetSlackNotification',
  type: new GraphQLNonNull(SetSlackNotificationPayload),
  args: {
    slackChannelId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    slackNotificationEvent: {
      type: new GraphQLNonNull(SlackNotificationEventEnum)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {slackChannelId, slackNotificationEvent, teamId},
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

    // RESOLUTION
    const slackAuths = await dataLoader.get('slackAuthByUserId').load(viewerId)
    const slackAuth = slackAuths.find((auth) => auth.teamId === teamId)

    if (!slackAuth) {
      return standardError(new Error('Slack authentication not found'), {userId: viewerId})
    }

    const manager = new SlackManager(slackAuth.accessToken)
    const channelInfo = await manager.getChannelInfo(slackChannelId)

    if (!channelInfo.ok) {
      return standardError(new Error(channelInfo.error), {userId: viewerId})
    }
    const {channel} = channelInfo
    const {is_archived: isArchived} = channel
    if (isArchived) return standardError(new Error('Slack channel archived'), {userId: viewerId})

    const existingNotification = await r
      .table('SlackNotification')
      .getAll(viewerId, {index: 'userId'})
      .filter({teamId, event: slackNotificationEvent})
    const notification = new SlackNotification({
      event: slackNotificationEvent,
      channelId: slackChannelId,
      teamId,
      userId: viewerId,
      id: (existingNotification && existingNotification.id) || undefined
    })
    await r.table('SlackNotification').insert(notification, {conflict: 'replace'})

    const data = {userId: viewerId}
    publish(TEAM, teamId, SetSlackNotificationPayload, data, subOptions)
    return data
  }
}
