import {AccessTime} from '@mui/icons-material'
import * as RadixPopover from '@radix-ui/react-popover'
import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import {Suspense, useState} from 'react'
import {useFragment} from 'react-relay'
import useTooltip from '~/hooks/useTooltip'
import type {DueDateToggle_task$key} from '../__generated__/DueDateToggle_task.graphql'
import {MenuPosition} from '../hooks/useCoords'
import type {UseTaskChild} from '../hooks/useTaskChildFocus'
import {cn} from '../ui/cn'
import lazyPreload from '../utils/lazyPreload'
import {shortMonths} from '../utils/makeDateString'
import CardButton from './CardButton'

interface Props {
  cardIsActive: boolean
  task: DueDateToggle_task$key
  useTaskChild: UseTaskChild
  isArchived?: boolean
}

const formatDueDate = (dueDate: string) => {
  const date = new Date(dueDate)
  const month = date.getMonth()
  const day = date.getDate()
  const monthStr = shortMonths[month]
  return `${monthStr} ${day}`
}

const action = 'tap to change'
const getDateInfo = (dueDate: string | null | undefined) => {
  if (!dueDate) return {title: 'Add a Due Date'}
  const date = new Date(dueDate)
  const timeDiff = date.getTime() - Date.now()
  const diffDays = Math.ceil(timeDiff / ms('1d'))
  if (diffDays <= 0) return {title: `Past due, ${action}`, isPastDue: true}
  if (diffDays < 3) return {title: `Due soon, ${action}`, isDueSoon: true}
  const dateString = formatDueDate(dueDate)
  return {title: `Due ${dateString}, ${action}`}
}

const DueDatePicker = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'DueDatePicker' */
      './DueDatePicker'
    )
)

const DueDateToggle = (props: Props) => {
  const {cardIsActive, task: taskRef, useTaskChild, isArchived} = props
  const task = useFragment(
    graphql`
      fragment DueDateToggle_task on Task {
        dueDate
        ...DueDatePicker_task
      }
    `,
    taskRef
  )
  const {dueDate} = task
  const [open, setOpen] = useState(false)
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  const {title, isPastDue, isDueSoon} = getDateInfo(dueDate)
  const toggleIsActive = !dueDate && cardIsActive
  if (isArchived) return null
  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <CardButton
          className={cn(
            'flex items-center justify-center rounded-md',
            toggleIsActive
              ? 'opacity-50 hover:opacity-100 focus:opacity-100'
              : 'opacity-0 hover:opacity-0 focus:opacity-0',
            'hover:bg-surface-hover focus:bg-surface-hover',
            dueDate &&
              'h-6 bg-surface-well pr-1 pl-px text-[length:inherit] text-fg-secondary leading-[1em] opacity-100 hover:bg-surface-raised hover:text-fg-primary hover:opacity-100 focus:bg-surface-raised focus:text-fg-primary focus:opacity-100',
            isDueSoon &&
              'bg-gold-100 text-gold-500 hover:bg-gold-200 hover:text-terra-500 focus:bg-gold-200 focus:text-terra-500',
            isPastDue &&
              'bg-tomato-100 text-tomato-500 hover:bg-tomato-200 hover:text-tomato-700 focus:bg-tomato-200 focus:text-tomato-700'
          )}
          tabIndex={0}
          onMouseEnter={DueDatePicker.preload}
        >
          <div
            className='h-[18px] w-[18px] [&_svg]:text-[18px]'
            onClick={closeTooltip}
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            ref={tipRef}
          >
            <AccessTime />
          </div>
          {dueDate && <span className='ml-0.5'>{formatDueDate(dueDate)}</span>}
        </CardButton>
      </RadixPopover.Trigger>
      {tooltipPortal(<div>{title}</div>)}
      <RadixPopover.Portal>
        <RadixPopover.Content
          align='end'
          sideOffset={4}
          collisionPadding={8}
          className='z-10 rounded-lg border border-hairline bg-surface-raised shadow-2xl'
        >
          <Suspense fallback={<div className='h-90 w-78' />}>
            <DueDatePicker
              closePopover={() => setOpen(false)}
              task={task}
              useTaskChild={useTaskChild}
            />
          </Suspense>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

export default DueDateToggle
