import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import SetDefaultSlackChannelPayload from '../types/SetDefaultSlackChannelPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext} from '../graphql'
import standardError from '../../utils/standardError'
import SlackServerManager from '../../utils/SlackServerManager'

const setDefaultSlackChannel = {
  type: GraphQLNonNull(SetDefaultSlackChannelPayload),
  description: 'Update the default Slack channel where notifications are sent',
  args: {
    slackChannelId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {slackChannelId, teamId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

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
    const {id: slackAuthId, accessToken, botAccessToken, defaultTeamChannelId} = slackAuth

    // use accessToken as a fallback for folks who haven't refreshed their auth lately
    const manager = new SlackServerManager(botAccessToken || accessToken)
    const channelInfo = await manager.getConversationInfo(slackChannelId)

    if (!channelInfo.ok) {
      return standardError(new Error(channelInfo.error), {userId: viewerId})
    }
    const {channel} = channelInfo
    if (!channel.is_im) {
      const {is_archived: isArchived} = channel
      if (isArchived) {
        return standardError(new Error('Slack channel archived'), {userId: viewerId})
      }
    }

    // RESOLUTION
    if (slackChannelId !== defaultTeamChannelId) {
      await r
        .table('SlackAuth')
        .get(slackAuthId)
        .update({defaultTeamChannelId: slackChannelId})
        .run()
    }
    const data = {teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'SetDefaultSlackChannelSuccess', data, subOptions)
    return data
  }
}

export default setDefaultSlackChannel
