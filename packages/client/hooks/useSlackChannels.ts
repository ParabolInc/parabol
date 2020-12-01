import {useEffect, useState} from 'react'
import {SlackIM, SlackPublicConversation} from '~/utils/SlackManager'
import {SlackChannelDropdownChannels} from '../components/SlackChannelDropdown'
import SlackClientManager from '../utils/SlackClientManager'

const useSlackChannels = (
  slackAuth: {botAccessToken: string | null; slackUserId: string} | null
) => {
  const [channels, setChannels] = useState<SlackChannelDropdownChannels>([])
  useEffect(() => {
    if (!slackAuth || !slackAuth.botAccessToken) return
    let isMounted = true
    const getChannels = async () => {
      const botManager = new SlackClientManager(slackAuth.botAccessToken!)
      const [channelResponse, convoResponse] = await Promise.all([
        botManager.getConversationList(),
        botManager.getConversationList(['im'])
      ])
      if (!isMounted) return
      if (!channelResponse.ok) {
        console.error(channelResponse.error)
        return
      }
      const publicChannels = channelResponse.channels as SlackPublicConversation[]
      const memberChannels = publicChannels.filter((channel) => channel.is_member)
      if (convoResponse.ok) {
        const ims = convoResponse.channels as SlackIM[]
        const botChannel = ims.find((im) => im.is_im && im.user === slackAuth.slackUserId) as any
        if (botChannel) {
          memberChannels.unshift({...botChannel, name: '@Parabol'})
        }
      }
      setChannels(memberChannels)
    }
    getChannels().catch()
    return () => {
      isMounted = false
    }
  }, [slackAuth])
  return channels
}

export default useSlackChannels
