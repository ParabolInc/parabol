import {HocuspocusProvider} from '@hocuspocus/provider'
import {DeleteOutline} from '~/ui/icons'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import {deleteRow} from './data'
import {useFocus} from './useFocus'

type Props = {
  provider: HocuspocusProvider
  rowId: string
}

export const AppendCell = (props: Props) => {
  const {provider, rowId} = props
  const {document: doc} = provider

  const {focusProps} = useFocus({
    provider,
    key: `append:${rowId}`
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
            aria-label='Delete row'
            className='flex size-7 cursor-pointer select-none items-center justify-center rounded-md text-fg-secondary no-hover:opacity-100 opacity-0 outline-accent hover:bg-surface-hover focus-visible:opacity-100 focus-visible:outline-2 group-hover/row:opacity-100'
            onClick={() => deleteRow(doc, rowId)}
          >
            <DeleteOutline className='text-[18px]' />
          </button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Delete row</TooltipContent>
      </Tooltip>
    </div>
  )
}
