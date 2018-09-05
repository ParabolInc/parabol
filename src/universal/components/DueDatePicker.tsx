import React from 'react'
import DayPicker from 'react-day-picker'
import 'universal/styles/daypicker.css'
import {DayModifiers} from 'react-day-picker/types/common'
import UpdateTaskDueDateMutation from 'universal/mutations/UpdateTaskDueDateMutation'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {createFragmentContainer, graphql} from 'react-relay'
import {DueDatePicker_task} from '__generated__/DueDatePicker_task.graphql'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'

interface Props extends WithAtmosphereProps, WithMutationProps {
  closePortal(): void
  task: DueDatePicker_task
}

const PickerTitle = styled('div')({
  fontSize: '.875rem',
  textAlign: 'center',
  userSelect: 'none',
  width: '100%'
})

const Hint = styled('div')({
  fontSize: '.6875rem',
  color: ui.hintFontColor,
  textAlign: 'center'
})

class DueDatePicker extends React.Component<Props> {
  handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled) return
    const {
      atmosphere,
      closePortal,
      task: {taskId},
      submitMutation,
      onCompleted,
      onError
    } = this.props
    submitMutation()
    const dueDate = selected ? null : day
    UpdateTaskDueDateMutation(atmosphere, {taskId, dueDate}, onCompleted, onError)
    closePortal()
  }

  render() {
    const {
      task: {dueDate}
    } = this.props
    const selectedDate = dueDate && new Date(dueDate)
    const showHint = false
    const now = new Date()
    const nextYear = new Date(new Date().setFullYear(now.getFullYear() + 1))
    return (
      <React.Fragment>
        <PickerTitle>{'Change Due Date'}</PickerTitle>
        {showHint && <Hint>{'To remove, tap selected date'}</Hint>}
        <DayPicker
          disabledDays={{before: now}}
          fromMonth={now}
          initialMonth={selectedDate || now}
          onDayClick={this.handleDayClick}
          selectedDays={selectedDate}
          toMonth={nextYear}
        />
      </React.Fragment>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(DueDatePicker)),
  graphql`
    fragment DueDatePicker_task on Task {
      taskId: id
      dueDate
    }
  `
)
