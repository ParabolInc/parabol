import {useEffect, useState} from 'react'
import {SlackChannelDropdownChannels} from 'universal/components/SlackChannelDropdown'
import SlackClientManager from 'universal/utils/SlackClientManager'

const useSlackChannels = (slackAuth: {accessToken: string | null} | null) => {
  const [channels, setChannels] = useState<SlackChannelDropdownChannels>([])
  useEffect(() => {
    if (!slackAuth || !slackAuth.accessToken) return
    let isMounted = true
    const getChannels = async () => {
      const manager = new SlackClientManager(slackAuth.accessToken!)
      const channelResponse = await manager.getChannelList()
      if (!isMounted || !channelResponse.ok) return
      const channels = channelResponse.channels.filter((channel) => channel.is_member)
      setChannels(channels)
    }
    getChannels().catch()
    return () => {
      isMounted = false
    }
  }, [slackAuth])
  return channels
}

export default useSlackChannels
