import {useEffect, useState} from 'react'
import {SlackChannelInfo, SlackIM} from '~/utils/SlackManager'
import {SlackChannelDropdownChannels} from '../components/SlackChannelDropdown'
import SlackClientManager from '../utils/SlackClientManager'

const useSlackChannels = (
  slackAuth: {accessToken: string | null; botAccessToken: string | null; slackUserId: string} | null
) => {
  const [channels, setChannels] = useState<SlackChannelDropdownChannels>([])
  useEffect(() => {
    if (!slackAuth || !slackAuth.botAccessToken) return
    let isMounted = true
    const getChannels = async () => {
      const botManager = new SlackClientManager(slackAuth.botAccessToken!)
      const userManager = new SlackClientManager(slackAuth.accessToken!)
      const [channelResponse, convoResponse] = await Promise.all([
        userManager.getConversationList(),
        botManager.getConversationList(['im'])
      ])
      if (!isMounted) return
      if (!channelResponse.ok) {
        console.error(channelResponse.error)
        return
      }
      const {channels} = channelResponse
      const publicChannels = channels as SlackChannelInfo[]
      const memberChannels = publicChannels.filter((channel) => channel.is_member)
      if (convoResponse.ok) {
        const {channels} = convoResponse
        const ims = channels as SlackIM[]
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
