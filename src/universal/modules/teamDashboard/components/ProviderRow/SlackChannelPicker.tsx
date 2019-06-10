import React from 'react'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import {
  SlackChannelDropdownChannels,
  SlackChannelDropdownOnClick
} from 'universal/components/SlackChannelDropdown'
import lazyPreload from 'universal/utils/lazyPreload'
import {SlackNotificationEventEnum} from '__generated__/SetSlackNotificationMutation.graphql'

interface Props {
  channels: SlackChannelDropdownChannels
  events: ReadonlyArray<SlackNotificationEventEnum>
  localChannelId: string | null
  onClick: SlackChannelDropdownOnClick
}

const SlackChannelDropdown = lazyPreload(() =>
  import(/* webpackChunkName: 'SlackChannelDropdown' */
  'universal/components/SlackChannelDropdown')
)

const SlackChannelPicker = (props: Props) => {
  const {channels, localChannelId, onClick} = props
  const activeIdx = localChannelId
    ? channels.findIndex((channel) => channel.id === localChannelId)
    : -1
  const activeText =
    activeIdx !== -1 ? channels[activeIdx].name : localChannelId ? '' : 'No Channel Set'
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  return (
    <>
      <DropdownMenuToggle
        onMouseEnter={SlackChannelDropdown.preload}
        onClick={togglePortal}
        ref={originRef}
        defaultText={activeText}
      />
      {menuPortal(
        <SlackChannelDropdown
          channels={channels}
          defaultActiveIdx={activeIdx}
          menuProps={menuProps}
          onClick={onClick}
        />
      )}
    </>
  )
}

export default SlackChannelPicker
