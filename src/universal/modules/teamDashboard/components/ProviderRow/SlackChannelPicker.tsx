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
import SlackClientManager from 'universal/utils/SlackClientManager'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMutationProps from 'universal/hooks/useMutationProps'

interface Props {
  isTokenValid: boolean
  channels: SlackChannelDropdownChannels
  events: ReadonlyArray<SlackNotificationEventEnum>
  localChannelId: string | null
  onClick: SlackChannelDropdownOnClick
  teamId: string
}

const SlackChannelDropdown = lazyPreload(() =>
  import(/* webpackChunkName: 'SlackChannelDropdown' */
  'universal/components/SlackChannelDropdown')
)

enum ChannelState {
  ready,
  loading,
  error
}

const SlackChannelPicker = (props: Props) => {
  const {isTokenValid, channels, localChannelId, onClick, teamId} = props
  const activeIdx = localChannelId
    ? channels.findIndex((channel) => channel.id === localChannelId)
    : -1
  const activeChannel = channels[activeIdx]
  const channelState = activeChannel
    ? ChannelState.ready
    : localChannelId && isTokenValid
    ? ChannelState.loading
    : ChannelState.error
  const activeText = activeChannel
    ? activeChannel.name
    : channelState === ChannelState.loading
    ? ''
    : 'Token Expired! Click to renew'
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const handleClick =
    channelState !== ChannelState.error
      ? togglePortal
      : () => {
        SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
      }
  return (
    <>
      <DropdownMenuToggle
        onMouseEnter={SlackChannelDropdown.preload}
        onClick={handleClick}
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
