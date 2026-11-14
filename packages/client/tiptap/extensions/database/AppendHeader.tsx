import {HocuspocusProvider} from '@hocuspocus/provider'
import {Add} from '~/ui/icons'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import {appendColumn} from './data'
import {useFocus} from './useFocus'

type Props = {
  provider: HocuspocusProvider
}

export const AppendHeader = (props: Props) => {
  const {provider} = props
  const {document: doc} = provider

  const {focusProps} = useFocus({
    provider,
    key: 'append'
  })

  return (
    <div className='flex h-full items-center px-1'>
      <Tooltip>
        <TooltipTrigger
          asChild
          // the grid refocuses this button after a click, which shouldn't pop the tooltip open under a pointer that has moved on
          onFocus={(e) => {
            if (!e.currentTarget.matches(':focus-visible')) e.preventDefault()
          }}
        >
          <button
            {...focusProps}
            aria-label='Add column'
            className='flex size-7 cursor-pointer select-none items-center justify-center rounded-md outline-accent hover:bg-surface-hover focus-visible:outline-2'
            onClick={() => appendColumn(doc)}
          >
            <Add className='text-[20px]' />
          </button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Add column</TooltipContent>
      </Tooltip>
    </div>
  )
}
