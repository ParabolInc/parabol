import {useEffect, useState} from 'react'
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
      const {botAccessToken, slackUserId} = slackAuth
      const botManager = new SlackClientManager(botAccessToken!)
      // Slack bug: requesting public, private and ims at once returns only
      // public channels so grab public channels in a separate request
      const [publicChannelRes, privateAndImChannelRes] = await Promise.all([
        botManager.getConversationList(),
        botManager.getConversationList(['private_channel', 'im'])
      ])
      if (!isMounted) return
      if (!publicChannelRes.ok) {
        console.error(publicChannelRes.error)
        return
      } else if (!privateAndImChannelRes.ok) {
        console.error(privateAndImChannelRes.error)
      }
      const channels = privateAndImChannelRes.ok
        ? [...publicChannelRes.channels, ...privateAndImChannelRes.channels]
        : publicChannelRes.channels
      const availableChannels = [] as SlackChannelDropdownChannels
      let slackbotChannelId: string | undefined
      channels.forEach((channel) => {
        if (channel.is_im && channel.user === slackUserId) {
          slackbotChannelId = channel.id
        } else if (!channel.is_im) {
          const {id, name} = channel
          availableChannels.push({id, name})
        }
      })
      availableChannels.sort((a, b) => (a.name > b.name ? 1 : -1))
      const botChannel = {
        id: slackbotChannelId || slackUserId,
        name: '@Parabol'
      }
      availableChannels.unshift({...botChannel, name: '@Parabol'})
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
