import React from 'react'
import DropdownMenuToggle from '../../../../components/DropdownMenuToggle'
import {
  SlackChannelDropdownChannels,
  SlackChannelDropdownOnClick
} from '../../../../components/SlackChannelDropdown'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import lazyPreload from '../../../../utils/lazyPreload'
import SlackClientManager from '../../../../utils/SlackClientManager'

interface Props {
  isTokenValid: boolean
  channels: SlackChannelDropdownChannels
  localChannelId: string | null
  onClick: SlackChannelDropdownOnClick
  teamId: string
}

const SlackChannelDropdown = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'SlackChannelDropdown' */
      '../../../../components/SlackChannelDropdown'
    )
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
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLDivElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )
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
