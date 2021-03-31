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
      const [publicChannelRes, slackIMRes, privateChannelRes] = await Promise.all([
        botManager.getConversationList(),
        botManager.getConversationList(['im']),
        botManager.getConversationList(['private_channel'])
      ])
      if (!isMounted) return
      if (!publicChannelRes.ok) {
        console.error(publicChannelRes.error)
        return
      }

      let availableChannels
      if (!isSlackIMArray(publicChannelRes.channels)) {
        const {channels: publicChannels} = publicChannelRes
        if (privateChannelRes.ok && privateChannelRes.channels.length) {
          availableChannels = [...privateChannelRes.channels, ...publicChannels]
        } else {
          availableChannels = publicChannels
        }
        availableChannels.sort((a, b) => (a.name > b.name ? 1 : -1))
      }
      if (slackIMRes.ok && isSlackIMArray(slackIMRes.channels)) {
        const {channels: ims} = slackIMRes
        const botChannel = ims.find((im) => im.is_im && im.user === slackAuth.slackUserId) as any
        if (botChannel) {
          availableChannels.unshift({...botChannel, name: '@Parabol'})
        }
      }
      setChannels(availableChannels)
    }
    getChannels().catch()
    return () => {
      isMounted = false
    }
  }, [slackAuth])
  return channels
}

export default useSlackChannels
