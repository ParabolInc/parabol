import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {DayModifiers, DayPicker} from 'react-day-picker'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useMutationProps from '../hooks/useMutationProps'
import {UseTaskChild} from '../hooks/useTaskChildFocus'
import UpdateTaskDueDateMutation from '../mutations/UpdateTaskDueDateMutation'
import {PALETTE} from '../styles/paletteV3'
import {DueDatePicker_task} from '../__generated__/DueDatePicker_task.graphql'
import Menu from './Menu'

interface Props {
  menuProps: MenuProps
  task: DueDatePicker_task
  useTaskChild: UseTaskChild
}

const TallMenu = styled(Menu)({
  maxHeight: 360
})

const PickerTitle = styled('div')({
  fontSize: 14,
  paddingTop: 8,
  textAlign: 'center',
  userSelect: 'none',
  width: '100%'
})

const Hint = styled('div')({
  fontSize: 11,
  color: PALETTE.SLATE_600,
  textAlign: 'center'
})

const DueDatePicker = (props: Props) => {
  const {menuProps, task, useTaskChild} = props
  const {id: taskId, dueDate} = task
  useTaskChild('dueDate')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled || submitting) return
    submitMutation()
    const dueDate = selected ? null : day
    UpdateTaskDueDateMutation(atmosphere, {taskId, dueDate}, {onCompleted, onError})
    menuProps.closePortal()
    ;(document as any).activeElement?.blur()
  }

  const selectedDate = dueDate ? new Date(dueDate) : undefined
  const showHint = false
  const now = new Date()
  const nextYear = new Date(new Date().setFullYear(now.getFullYear() + 1))
  return (
    <TallMenu ariaLabel='Pick a due date' {...menuProps}>
      <>
        <PickerTitle>{'Change Due Date'}</PickerTitle>
        {showHint && <Hint>{'To remove, tap selected date'}</Hint>}
        <DayPicker
          disabled={{before: now}}
          fromMonth={now}
          defaultMonth={selectedDate || now}
          onDayClick={handleDayClick}
          selected={selectedDate}
          toMonth={nextYear}
        />
      </>
    </TallMenu>
  )
}

export default createFragmentContainer(DueDatePicker, {
  task: graphql`
    fragment DueDatePicker_task on Task {
      id
      dueDate
    }
  `
})
