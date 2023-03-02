import styled from '@emotion/styled'
import {AccessTime} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import ms from 'ms'
import React from 'react'
import {useFragment} from 'react-relay'
import useTooltip from '~/hooks/useTooltip'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {UseTaskChild} from '../hooks/useTaskChildFocus'
import {PALETTE} from '../styles/paletteV3'
import lazyPreload from '../utils/lazyPreload'
import {shortMonths} from '../utils/makeDateString'
import {DueDateToggle_task$key} from '../__generated__/DueDateToggle_task.graphql'
import CardButton from './CardButton'

interface StyleProps {
  cardIsActive: boolean
  dueDate: boolean
  isDueSoon?: boolean
  isPastDue?: boolean
}

const DUE_DATE_BG = PALETTE.SLATE_200
const DUE_DATE_BG_HOVER = PALETTE.SLATE_300
const DUE_DATE_COLOR = PALETTE.SLATE_600
const DUE_DATE_COLOR_HOVER = PALETTE.SLATE_700

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
    borderRadius: '4em',
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
const getDateInfo = (dueDate: string | null) => {
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
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu(MenuPosition.UPPER_RIGHT)
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  const {title, isPastDue, isDueSoon} = getDateInfo(dueDate)
  return (
    <>
      {!isArchived && (
        <Toggle
          cardIsActive={!dueDate && cardIsActive}
          tabIndex={0}
          dueDate={!!dueDate}
          isPastDue={isPastDue}
          isDueSoon={isDueSoon}
          ref={originRef}
          onClick={togglePortal}
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
      )}
      {tooltipPortal(<div>{title}</div>)}
      {menuPortal(<DueDatePicker menuProps={menuProps} task={task} useTaskChild={useTaskChild} />)}
    </>
  )
}

export default DueDateToggle
