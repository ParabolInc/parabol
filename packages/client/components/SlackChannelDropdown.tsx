import React from 'react'
import {useTranslation} from 'react-i18next'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'

export type SlackChannelDropdownChannels = {id: string; name: string}[]
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

  const {t} = useTranslation()

  return (
    <Menu
      ariaLabel={t('SlackChannelDropdown.SelectTheChannelToSendNotificationsTo')}
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
