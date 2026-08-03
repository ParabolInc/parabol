import graphql from 'babel-plugin-relay/macro'
import {type DayModifiers, DayPicker} from 'react-day-picker'
import {useFragment} from 'react-relay'
import type {DueDatePicker_task$key} from '../__generated__/DueDatePicker_task.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import type {UseTaskChild} from '../hooks/useTaskChildFocus'
import UpdateTaskDueDateMutation from '../mutations/UpdateTaskDueDateMutation'

interface Props {
  closePopover: () => void
  task: DueDatePicker_task$key
  useTaskChild: UseTaskChild
}

const DueDatePicker = (props: Props) => {
  const {closePopover, task: taskRef, useTaskChild} = props
  const task = useFragment(
    graphql`
      fragment DueDatePicker_task on Task {
        id
        dueDate
      }
    `,
    taskRef
  )
  const {id: taskId, dueDate} = task
  useTaskChild('dueDate')
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const handleDayClick = (day: Date, {disabled, selected}: DayModifiers) => {
    if (disabled || submitting) return
    submitMutation()
    const dueDate = selected ? null : day
    UpdateTaskDueDateMutation(atmosphere, {taskId, dueDate}, {onCompleted, onError})
    closePopover()
  }

  const selectedDate = dueDate ? new Date(dueDate) : undefined
  const now = new Date()
  const nextYear = new Date(new Date().setFullYear(now.getFullYear() + 1))
  return (
    <div className='select-none'>
      <div className='w-full pt-2 text-center text-sm'>{'Change Due Date'}</div>
      <DayPicker
        disabled={{before: now}}
        fromMonth={now}
        defaultMonth={selectedDate || now}
        onDayClick={handleDayClick}
        selected={selectedDate}
        toMonth={nextYear}
      />
    </div>
  )
}

export default DueDatePicker
