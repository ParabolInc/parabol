import * as Popover from '@radix-ui/react-popover'
import type {ComponentProps} from 'react'
import {Comment as CommentIcon} from '~/ui/icons'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import {PageThreadList} from './PageThreadList'

export const PageThreadsButton = (props: ComponentProps<typeof PageThreadList>) => {
  const {threads} = props
  const openThreadCount = threads.filter(({resolvedAt}) => !resolvedAt).length
  return (
    <Popover.Root>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover.Trigger asChild>
            <button
              aria-label={`Comments, ${openThreadCount} open`}
              className='flex h-6 cursor-pointer items-center gap-1 rounded-md px-1 hover:bg-surface-hover data-[state=open]:bg-surface-hover'
            >
              <CommentIcon className='text-[18px]' />
              {openThreadCount > 0 && <span className='text-sm'>{openThreadCount}</span>}
            </button>
          </Popover.Trigger>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Comments</TooltipContent>
      </Tooltip>
      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={8}
          collisionPadding={8}
          className='z-10 flex max-h-[var(--radix-popper-available-height)] w-80 max-w-[var(--radix-popover-content-available-width)] flex-col overflow-hidden rounded-lg border border-hairline bg-surface-raised font-normal shadow-dialog data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
        >
          <PageThreadList {...props} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
