import React from 'react'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import {MenuProps} from 'universal/hooks/useMenu'

export type SlackChannelDropdownChannels = ReadonlyArray<{id: string | null; name: string}>
export type SlackChannelDropdownOnClick = (
  channelId: string | null
) => (e: React.MouseEvent) => void

interface Props {
  channels: SlackChannelDropdownChannels
  menuProps: MenuProps
  defaultActiveIdx: number
  onClick: SlackChannelDropdownOnClick
}

const SlackChannelDropdown = (props: Props) => {
  const {defaultActiveIdx, channels, menuProps, onClick} = props
  return (
    <Menu
      ariaLabel={'Select the channel to send notifications to'}
      {...menuProps}
      defaultActiveIdx={defaultActiveIdx}
    >
      {channels.map((channel) => {
        return <MenuItem key={channel.id!} label={channel.name} onClick={onClick(channel.id)} />
      })}
    </Menu>
  )
}

export default SlackChannelDropdown
