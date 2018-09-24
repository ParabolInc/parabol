// @flow
import * as React from 'react'
import styled from 'react-emotion'
import LoadableMenu from 'universal/components/LoadableMenu'
import LoadableDueDatePicker from 'universal/components/LoadableDueDatePicker'
import {createFragmentContainer} from 'react-relay'
import {shortMonths} from 'universal/utils/makeDateString'
import ui from 'universal/styles/ui'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import CardButton from 'universal/components/CardButton'
import ms from 'ms'
import tinycolor from 'tinycolor2'

const darken = (color, amount) =>
  tinycolor(color)
    .darken(amount)
    .toString()

const Toggle = styled(CardButton)(
  {
    alignItems: 'center',
    borderRadius: '4em',
    display: 'flex',
    justifyContent: 'center',
    opacity: 0
  },
  ({cardIsActive}) => ({
    opacity: cardIsActive && 0.5,
    ':hover, :focus': {
      backgroundColor: ui.palette.gray,
      opacity: cardIsActive && 1
    }
  }),
  ({dueDate}) =>
    dueDate && {
      backgroundColor: ui.dueDateBg,
      color: ui.dueDateColor,
      fontSize: 'inherit',
      height: '1.125rem',
      lineHeight: '1rem',
      opacity: 1,
      padding: '0 .1875rem',
      ':hover,:focus': {
        backgroundColor: darken(ui.dueDateBg, 6),
        color: darken(ui.dueDateColor, 6)
      }
    },
  ({isDueSoon}) =>
    isDueSoon && {
      backgroundColor: ui.dueDateSoonBg,
      color: ui.dueDateSoonColor,
      ':hover,:focus': {
        backgroundColor: darken(ui.dueDateSoonBg, 9),
        color: darken(ui.dueDateSoonColor, 9)
      }
    },
  ({isPastDue}) =>
    isPastDue && {
      backgroundColor: ui.dueDatePastBg,
      color: ui.dueDatePastColor,
      ':hover,:focus': {
        backgroundColor: darken(ui.dueDatePastBg, 9),
        color: darken(ui.dueDatePastColor, 9)
      }
    }
)

const DueDateIcon = styled(StyledFontAwesome)({
  fontSize: ui.iconSize
})

const DateString = styled('span')({
  marginLeft: '0.25rem'
})

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

type Props = {|
  cardIsActive: Boolean,
  task: Object,
  toggleMenuState: () => void
|}

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
  const now = new Date()
  const timeDiff = date - now
  const diffDays = Math.ceil(timeDiff / ms('1d'))
  if (diffDays < 0) return {title: `Past due, ${action}`, isPastDue: true}
  if (diffDays < 3) return {title: `Due soon, ${action}`, isDueSoon: true}
  const dateString = formatDueDate(dueDate)
  return {title: `Due ${dateString}, ${action}`}
}

const DueDateToggle = (props: Props) => {
  const {cardIsActive, task, toggleMenuState} = props
  const {dueDate} = task
  const toggle = (
    <Toggle cardIsActive={!dueDate && cardIsActive} dueDate={dueDate} {...getDateInfo(dueDate)}>
      <DueDateIcon name='clock-o' />
      {dueDate && <DateString>{formatDueDate(dueDate)}</DateString>}
    </Toggle>
  )
  return (
    <LoadableMenu
      LoadableComponent={LoadableDueDatePicker}
      maxWidth={350}
      maxHeight={340}
      originAnchor={originAnchor}
      queryVars={{
        task
      }}
      targetAnchor={targetAnchor}
      toggle={toggle}
      onOpen={toggleMenuState}
      onClose={toggleMenuState}
    />
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
