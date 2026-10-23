import * as RadixPopover from '@radix-ui/react-popover'
import {useContext} from 'react'
import {cn} from '../../ui/cn'
import {NestedModalContext} from '../../ui/Modal/NestedModalContext'

const ReportTeamHealthMarksInfo = () => {
  const isNested = useContext(NestedModalContext)
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger className='font-semibold text-sky-600 hover:underline dark:text-accent'>
        How marks are chosen
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align='start'
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            'w-80 rounded-md border border-hairline bg-surface-raised p-4 text-fg-primary text-sm leading-5 shadow-[var(--shadow-card-raised)]',
            isNested ? 'z-40' : 'z-10'
          )}
        >
          <p className='m-0'>Each cell gets an attention score from 0 to 1:</p>
          <ul className='m-0 mt-1 pl-5'>
            <li>half from how negative its AI summary reads</li>
            <li>a quarter from how far apart the answers are, once 4 people answer</li>
            <li>a quarter from the share of people who commented</li>
          </ul>
          <p className='m-0 mt-2'>
            A reading that’s missing hands its weight to the others, but comments alone never mark a
            cell. A score of 0.5 marks it low, 0.75 medium and 0.9 high. A summary that reads +0.8
            or more makes a bright spot.
          </p>
          <p className='m-0 mt-2'>
            No more than 1 cell in 5 is marked, counting every team you can report on, whatever the
            filters. Cells that need attention come first, and bright spots fill the room left.
          </p>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default ReportTeamHealthMarksInfo
