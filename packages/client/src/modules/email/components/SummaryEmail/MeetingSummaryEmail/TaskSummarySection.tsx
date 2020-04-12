import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {TaskSummarySection_tasks} from '../../../../../__generated__/TaskSummarySection_tasks.graphql'
import useEmailItemGrid from '../../../../../hooks/useEmailItemGrid'
import EmailTaskCard from './EmailTaskCard'
import {PALETTE} from '../../../../../styles/paletteV2'
import {FONT_FAMILY} from '../../../../../styles/typographyV2'

interface Props {
  label: string
  tasks: TaskSummarySection_tasks | null
}

const taskTypeStyle = {
  color: PALETTE.TEXT_MAIN,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 14,
  fontWeight: 600,
  paddingBottom: 16,
  paddingTop: 24
}

const TaskSummarySection = (props: Props) => {
  const {label, tasks} = props
  const grid = useEmailItemGrid(tasks || [], 3, 2)
  if (!tasks || !tasks.length) return null
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
