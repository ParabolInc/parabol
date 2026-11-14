import {Suspense} from 'react'
import type {
  SlackChannelDropdownChannels,
  SlackChannelDropdownOnClick
} from '../../../../components/SlackChannelDropdown'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {Button} from '../../../../ui/Button/Button'
import {Select} from '../../../../ui/Select/Select'
import {SelectTrigger} from '../../../../ui/Select/SelectTrigger'
import {SelectValue} from '../../../../ui/Select/SelectValue'
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

const SlackChannelPicker = (props: Props) => {
  const {isTokenValid, channels, localChannelId, onClick, onOpen, teamId} = props
  const activeChannel = channels.find((channel) => channel.id === localChannelId)
  const isLoading = !activeChannel && !!localChannelId && isTokenValid
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()

  if (!activeChannel && !isLoading) {
    return (
      <Button
        variant='outline'
        className='h-11 w-full justify-start rounded-sm border-hairline-field px-2 py-1 font-normal text-sm'
        onClick={() => {
          SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
        }}
      >
        {'Token Expired! Click to renew'}
      </Button>
    )
  }

  return (
    <Select
      value={activeChannel?.id}
      onValueChange={onClick}
      onOpenChange={(isOpen) => isOpen && onOpen()}
    >
      <SelectTrigger
        isLoading={isLoading}
        disabled={isLoading}
        onMouseEnter={SlackChannelDropdown.preload}
      >
        <SelectValue />
      </SelectTrigger>
      <Suspense fallback={null}>
        <SlackChannelDropdown channels={channels} />
      </Suspense>
    </Select>
  )
}

export default SlackChannelPicker
