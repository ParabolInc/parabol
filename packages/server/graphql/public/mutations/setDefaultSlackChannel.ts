import getKysely from '../../../postgres/getKysely'
import SlackServerManager from '../../../utils/SlackServerManager'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const setDefaultSlackChannel: MutationResolvers['setDefaultSlackChannel'] = async (
  _source,
  {slackChannelId, teamId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)

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
  const {id: slackAuthId, botAccessToken, defaultTeamChannelId, slackUserId} = slackAuth
  const manager = new SlackServerManager(botAccessToken!)
  const channelInfo = await manager.getConversationInfo(slackChannelId)

  // should either be a public / private channel or the slackUserId if messaging from @Parabol
  if (slackChannelId !== slackUserId) {
    if (!channelInfo.ok) {
      return standardError(new Error(channelInfo.error), {userId: viewerId})
    }
    const {channel} = channelInfo
    const {id: channelId, is_member: isMember, is_archived: isArchived} = channel
    if (isArchived) {
      return standardError(new Error('Slack channel archived'), {userId: viewerId})
    }
    if (!isMember) {
      const joinConvoRes = await manager.joinConversation(channelId)
      if (!joinConvoRes.ok) {
        return standardError(new Error('Unable to join slack channel'), {userId: viewerId})
      }
    }
  }

  // RESOLUTION
  if (slackChannelId !== defaultTeamChannelId) {
    await getKysely()
      .updateTable('SlackAuth')
      .set({
        defaultTeamChannelId: slackChannelId
      })
      .where('id', '=', slackAuthId)
      .execute()
  }
  const data = {slackChannelId, teamId, userId: viewerId}
  return data
}

export default setDefaultSlackChannel
