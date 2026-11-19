import * as RadixPopover from '@radix-ui/react-popover'
import type {ReactNode} from 'react'
import {MoreHoriz} from '~/ui/icons'

interface Props {
  count: number
  children: ReactNode
}

const InspirationMoreSources = (props: Props) => {
  const {count, children} = props
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>
        <button
          type='button'
          aria-label={`${count} more sources`}
          className='flex h-16 w-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-hairline-strong bg-surface-card transition-colors hover:bg-surface-hover data-[state=open]:border-accent data-[state=open]:ring-1 data-[state=open]:ring-accent'
        >
          <span className='flex h-7 w-7 items-center justify-center text-fg-secondary'>
            <MoreHoriz className='text-[28px]' />
          </span>
          <span className='font-semibold text-[11px] text-fg-primary'>More</span>
        </button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align='end'
          sideOffset={6}
          collisionPadding={8}
          aria-label='More sources'
          className='z-30 flex max-w-[272px] flex-wrap gap-2 rounded-lg border border-hairline bg-surface-raised p-3 shadow-xl'
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default InspirationMoreSources
