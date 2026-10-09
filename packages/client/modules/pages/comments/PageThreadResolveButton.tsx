import {Check as CheckIcon, Replay as ReplayIcon} from '~/ui/icons'
import {useUpdatePageThreadMutation} from '../../../mutations/useUpdatePageThreadMutation'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'

interface Props {
  threadId: string
  isResolved: boolean
}

export const PageThreadResolveButton = (props: Props) => {
  const {threadId, isResolved} = props
  const [updateThread, submitting] = useUpdatePageThreadMutation()
  const label = isResolved ? 'Reopen thread' : 'Resolve thread'
  const Icon = isResolved ? ReplayIcon : CheckIcon
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={label}
          disabled={submitting}
          onClick={() => updateThread({variables: {threadId, isResolved: !isResolved}})}
          className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-fg-secondary hover:bg-surface-hover disabled:opacity-50'
        >
          <Icon className='text-[18px]' />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
