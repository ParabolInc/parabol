import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {TaskSummarySection_tasks} from '../../../../../../__generated__/TaskSummarySection_tasks.graphql'
import useEmailItemGrid from '../../../../../hooks/useEmailItemGrid'
import EmailTaskCard from './EmailTaskCard'
import {
  FONT_FAMILY,
  PALETTE_TEXT_MAIN
} from './constants'

interface Props {
  label: string
  tasks: TaskSummarySection_tasks | null
}

const taskTypeStyle = {
  color: PALETTE_TEXT_MAIN,
  fontFamily: FONT_FAMILY,
  fontSize: 14,
  fontWeight: 600,
  paddingBottom: 16,
  paddingTop: 24
}

const TaskSummarySection = (props: Props) => {
  const {label, tasks} = props
  if (!tasks || !tasks.length) return null
  const grid = useEmailItemGrid(tasks, 3, 2)
  return (
    <>
      <tr>
        <td align='center' style={taskTypeStyle}>
          {label}
        </td>
      </tr>
      <tr>
        <td>
          {grid((task) => (
            <EmailTaskCard key={task.id} task={task} />
          ))}
        </td>
      </tr>
    </>
  )
}

export default createFragmentContainer(TaskSummarySection, {
  tasks: graphql`
    fragment TaskSummarySection_tasks on Task @relay(plural: true) {
      ...EmailTaskCard_task
    }
  `
})
