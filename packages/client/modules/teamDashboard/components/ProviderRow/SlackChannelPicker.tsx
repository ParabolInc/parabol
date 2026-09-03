import {Suspense} from 'react'
import DropdownMenuToggle from '../../../../components/DropdownMenuToggle'
import type {
  SlackChannelDropdownChannels,
  SlackChannelDropdownOnClick
} from '../../../../components/SlackChannelDropdown'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {Select} from '../../../../ui/Select/Select'
import {SelectTrigger} from '../../../../ui/Select/SelectTrigger'
import lazyPreload from '../../../../utils/lazyPreload'
import SlackClientManager from '../../../../utils/SlackClientManager'

interface Props {
  isTokenValid: boolean
  channels: SlackChannelDropdownChannels
  localChannelId: string | null
  onClick: SlackChannelDropdownOnClick
  onOpen: () => void
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
  const {isTokenValid, channels, localChannelId, onClick, onOpen, teamId} = props
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
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  const toggle = (
    <DropdownMenuToggle onMouseEnter={SlackChannelDropdown.preload} defaultText={activeText} />
  )

  if (channelState === ChannelState.error) {
    return (
      <DropdownMenuToggle
        onMouseEnter={SlackChannelDropdown.preload}
        onClick={() => {
          SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
        }}
        defaultText={activeText}
      />
    )
  }

  return (
    <Select
      value={activeChannel?.id}
      onValueChange={onClick}
      onOpenChange={(isOpen) => isOpen && onOpen()}
    >
      <SelectTrigger asChild>{toggle}</SelectTrigger>
      <Suspense fallback={null}>
        <SlackChannelDropdown channels={channels} />
      </Suspense>
    </Select>
  )
}

export default SlackChannelPicker
