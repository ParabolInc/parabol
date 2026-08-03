import styled from '@emotion/styled'
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
import {PALETTE} from '../styles/paletteV3'
import {Radius} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import {shortMonths} from '../utils/makeDateString'
import CardButton from './CardButton'

interface StyleProps {
  cardIsActive: boolean
  dueDate: boolean
  isDueSoon?: boolean
  isPastDue?: boolean
}

const DUE_DATE_BG = 'var(--color-surface-well)'
const DUE_DATE_BG_HOVER = 'var(--color-surface-raised)'
const DUE_DATE_COLOR = 'var(--color-fg-secondary)'
const DUE_DATE_COLOR_HOVER = 'var(--color-fg-primary)'

const DUE_DATE_PAST_BG = PALETTE.TOMATO_100
const DUE_DATE_PAST_BG_HOVER = PALETTE.TOMATO_200
const DUE_DATE_PAST_COLOR = PALETTE.TOMATO_500
const DUE_DATE_PAST_COLOR_HOVER = PALETTE.TOMATO_700

const DUE_DATE_SOON_BG = PALETTE.GOLD_100
const DUE_DATE_SOON_BG_HOVER = PALETTE.GOLD_200
const DUE_DATE_SOON_COLOR = PALETTE.GOLD_500
const DUE_DATE_SOON_COLOR_HOVER = PALETTE.TERRA_500

const Toggle = styled(CardButton)<StyleProps>(
  {
    alignItems: 'center',
    borderRadius: Radius.BUTTON,
    display: 'flex',
    justifyContent: 'center',
    opacity: 0
  },
  ({cardIsActive}) => ({
    opacity: cardIsActive ? 0.5 : 0,
    ':hover, :focus': {
      backgroundColor: DUE_DATE_BG,
      opacity: cardIsActive ? 1 : 0
    }
  }),
  ({dueDate}) =>
    dueDate && {
      backgroundColor: DUE_DATE_BG,
      color: DUE_DATE_COLOR,
      fontSize: 'inherit',
      height: 24,
      lineHeight: '1em',
      opacity: 1,
      padding: '0 4px 0 1px',
      ':hover,:focus': {
        backgroundColor: DUE_DATE_BG_HOVER,
        color: DUE_DATE_COLOR_HOVER,
        opacity: 1
      }
    },
  ({isDueSoon}) =>
    isDueSoon && {
      backgroundColor: DUE_DATE_SOON_BG,
      color: DUE_DATE_SOON_COLOR,
      ':hover,:focus': {
        backgroundColor: DUE_DATE_SOON_BG_HOVER,
        color: DUE_DATE_SOON_COLOR_HOVER
      }
    },
  ({isPastDue}) =>
    isPastDue && {
      backgroundColor: DUE_DATE_PAST_BG,
      color: DUE_DATE_PAST_COLOR,
      ':hover,:focus': {
        backgroundColor: DUE_DATE_PAST_BG_HOVER,
        color: DUE_DATE_PAST_COLOR_HOVER
      }
    }
)

const DueDateIcon = styled('div')({
  svg: {
    fontSize: 18
  },
  height: 18,
  width: 18
})

const DateString = styled('span')({
  marginLeft: 2
})

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
  if (isArchived) return null
  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Trigger asChild>
        <Toggle
          cardIsActive={!dueDate && cardIsActive}
          tabIndex={0}
          dueDate={!!dueDate}
          isPastDue={isPastDue}
          isDueSoon={isDueSoon}
          onMouseEnter={DueDatePicker.preload}
        >
          <DueDateIcon
            onClick={closeTooltip}
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            ref={tipRef}
          >
            <AccessTime />
          </DueDateIcon>
          {dueDate && <DateString>{formatDueDate(dueDate)}</DateString>}
        </Toggle>
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
