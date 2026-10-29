import * as RadixPopover from '@radix-ui/react-popover'
import {useContext} from 'react'
import {cn} from '../../ui/cn'
import {NestedModalContext} from '../../ui/Modal/NestedModalContext'

const ReportTeamHealthMarksInfo = () => {
  const isNested = useContext(NestedModalContext)
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger className='font-semibold text-sky-600 hover:underline dark:text-accent'>
        How it’s chosen
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align='start'
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            'w-84 rounded-md border border-hairline bg-surface-raised p-4 text-fg-primary text-sm leading-5 shadow-[var(--shadow-card-raised)]',
            isNested ? 'z-40' : 'z-10'
          )}
        >
          <p className='m-0'>We look at:</p>
          <ul className='m-0 mt-1 list-disc pl-5'>
            <li>
              <strong className='font-semibold'>Tone:</strong> how the AI summary reads
            </li>
            <li>
              <strong className='font-semibold'>Agreement:</strong> how spread out the answers are
            </li>
            <li>
              <strong className='font-semibold'>Engagement:</strong> how many people commented
            </li>
          </ul>
          <p className='m-0 mt-2'>Then we flag the few cells that stand out most.</p>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default ReportTeamHealthMarksInfo
