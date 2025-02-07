import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels'
import {useSelector} from 'react-redux'

export const useCurrentChannel = () => {
  const channel = useSelector(getCurrentChannel)
  if (!channel) {
    return null
  }

  return {id: channel.id, name: channel.display_name}
}
