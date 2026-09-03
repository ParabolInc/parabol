import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectSeparator} from '../ui/Select/SelectSeparator'
import SlackPrivateChannelHint from './SlackPrivateChannelHint'

export type SlackChannelDropdownChannels = {id: string; name: string}[]
export type SlackChannelDropdownOnClick = (channelId: string) => void

interface Props {
  channels: SlackChannelDropdownChannels
}

const SlackChannelDropdown = (props: Props) => {
  const {channels} = props
  return (
    <SelectContent align='end' className='max-h-56 overflow-y-auto'>
      {channels.map((channel) => {
        return (
          <SelectItem key={channel.id} value={channel.id}>
            {channel.name}
          </SelectItem>
        )
      })}
      <SelectSeparator />
      <SlackPrivateChannelHint />
    </SelectContent>
  )
}

export default SlackChannelDropdown
