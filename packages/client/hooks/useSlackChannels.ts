import {useEffect, useState} from 'react'
import {SlackChannelDropdownChannels} from '../components/SlackChannelDropdown'
import SlackClientManager from '../utils/SlackClientManager'
import {isSlackIMArray} from '~/utils/isSlackIMArray.ts'

const useSlackChannels = (
  slackAuth: {botAccessToken: string | null; slackUserId: string} | null
) => {
  const [channels, setChannels] = useState<SlackChannelDropdownChannels>([])
  useEffect(() => {
    if (!slackAuth || !slackAuth.botAccessToken) return
    let isMounted = true
    const getChannels = async () => {
      const botManager = new SlackClientManager(slackAuth.botAccessToken!)
      const [publicChannelRes, slackIMRes] = await Promise.all([
        botManager.getConversationList(),
        botManager.getConversationList(['im'])
      ])
      if (!isMounted) return
      if (!publicChannelRes.ok) {
        console.error(publicChannelRes.error)
        return
      }

      let memberChannels
      if (!isSlackIMArray(publicChannelRes.channels)) {
        const {channels: publicChannels} = publicChannelRes
        memberChannels = publicChannels.filter((channel) => channel.is_member)
      }
      if (slackIMRes.ok && isSlackIMArray(slackIMRes.channels)) {
        const {channels: ims} = slackIMRes
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
