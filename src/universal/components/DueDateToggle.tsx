import {DueDateToggle_task} from '__generated__/DueDateToggle_task.graphql'
import ms from 'ms'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import tinycolor from 'tinycolor2'
import CardButton from 'universal/components/CardButton'
import Icon from 'universal/components/Icon'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'
import ui from 'universal/styles/ui'
import lazyPreload from 'universal/utils/lazyPreload'
import {shortMonths} from 'universal/utils/makeDateString'
import {PALETTE} from 'universal/styles/paletteV2'

const darken = (color, amount) =>
  tinycolor(color)
    .darken(amount)
    .toString()

interface StyleProps {
  cardIsActive: boolean
  dueDate: boolean
  isDueSoon: boolean
  isPastDue: boolean
}

const dueDateBg = PALETTE.BACKGROUND.MAIN
const dueDateColor = '#65637A'
const dueDatePastBg = '#FFE2E2'
const dueDatePastColor = PALETTE.ERROR.MAIN
const dueDateSoonBg = '#FFF0D1'
const dueDateSoonColor = '#F28934'

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
      backgroundColor: ui.palette.gray,
      opacity: cardIsActive ? 1 : 0
    }
  }),
  ({dueDate}) =>
    dueDate && {
      backgroundColor: ui.dueDateBg,
      color: dueDateColor,
      fontSize: 'inherit',
      height: '1.375rem',
      lineHeight: '1rem',
      opacity: 1,
      padding: '0 .25rem 0 .0625rem',
      ':hover,:focus': {
        backgroundColor: darken(dueDateBg, 6),
        color: darken(dueDateColor, 6),
        opacity: 1
      }
    },
  ({isDueSoon}) =>
    isDueSoon && {
      backgroundColor: dueDateSoonBg,
      color: dueDateSoonColor,
      ':hover,:focus': {
        backgroundColor: darken(dueDateSoonBg, 9),
        color: darken(dueDateSoonColor, 9)
      }
    },
  ({isPastDue}) =>
    isPastDue && {
      backgroundColor: dueDatePastBg,
      color: dueDatePastColor,
      ':hover,:focus': {
        backgroundColor: darken(dueDatePastBg, 9),
        color: darken(dueDatePastColor, 9)
      }
    }
)

const DueDateIcon = styled(Icon)({
  fontSize: MD_ICONS_SIZE_18
})

const DateString = styled('span')({
  marginLeft: '0.125rem'
})

interface Props {
  cardIsActive: boolean
  task: DueDateToggle_task
  toggleMenuState: () => void
}

const formatDueDate = (dueDate) => {
  const date = new Date(dueDate)
  const month = date.getMonth()
  const day = date.getDate()
  const monthStr = shortMonths[month]
  return `${monthStr} ${day}`
}

const action = 'tap to change'
const getDateInfo = (dueDate) => {
  if (!dueDate) return {title: 'Add a due date'}
  const date = new Date(dueDate)
  const timeDiff = date.getTime() - Date.now()
  const diffDays = Math.ceil(timeDiff / ms('1d'))
  if (diffDays <= 0) return {title: `Past due, ${action}`, isPastDue: true}
  if (diffDays < 3) return {title: `Due soon, ${action}`, isDueSoon: true}
  const dateString = formatDueDate(dueDate)
  return {title: `Due ${dateString}, ${action}`}
}

const DueDatePicker = lazyPreload(() =>
  import(/* webpackChunkName: 'DueDatePicker' */
  'universal/components/DueDatePicker')
)

const DueDateToggle = (props: Props) => {
  const {cardIsActive, task, toggleMenuState} = props
  const {dueDate} = task
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu(MenuPosition.UPPER_RIGHT, {
    onOpen: toggleMenuState,
    onClose: toggleMenuState
  })
  return (
    <>
      <Toggle
        cardIsActive={!dueDate && cardIsActive}
        dueDate={dueDate}
        {...getDateInfo(dueDate)}
        innerRef={originRef}
        onClick={togglePortal}
        onMouseEnter={DueDatePicker.preload}
      >
        <DueDateIcon>access_time</DueDateIcon>
        {dueDate && <DateString>{formatDueDate(dueDate)}</DateString>}
      </Toggle>
      {menuPortal(<DueDatePicker menuProps={menuProps} task={task} />)}
    </>
  )
}

export default createFragmentContainer(
  DueDateToggle,
  graphql`
    fragment DueDateToggle_task on Task {
      dueDate
      ...DueDatePicker_task
    }
  `
)
