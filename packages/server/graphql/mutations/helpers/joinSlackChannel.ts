import type SlackManager from 'parabol-client/utils/SlackManager'

type JoinSlackChannelResult = {ok: true; channelId: string} | {ok: false; error: string}

type ChannelManager = Pick<SlackManager, 'getConversationInfo' | 'joinConversation'>

const joinSlackChannel = async (
  manager: ChannelManager,
  channelId: string
): Promise<JoinSlackChannelResult> => {
  const channelInfo = await manager.getConversationInfo(channelId)
  if (!channelInfo.ok) {
    return {ok: false, error: channelInfo.error}
  }
  const {channel} = channelInfo
  if (channel.is_archived) {
    return {ok: false, error: 'Slack channel archived'}
  }
  if (channel.is_member) {
    return {ok: true, channelId: channel.id}
  }
  const joinConvoRes = await manager.joinConversation(channelId)
  if (!joinConvoRes.ok) {
    return {ok: false, error: 'Unable to join slack channel'}
  }
  return {ok: true, channelId: joinConvoRes.channel.id}
}

export default joinSlackChannel
