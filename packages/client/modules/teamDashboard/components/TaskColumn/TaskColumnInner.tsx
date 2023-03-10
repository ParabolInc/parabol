import graphql from 'babel-plugin-relay/macro'
import React, {memo} from 'react'
import {useFragment} from 'react-relay'
import {TaskColumnInner_tasks$key} from '~/__generated__/TaskColumnInner_tasks.graphql'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import DraggableTask from '../../../../containers/TaskCard/DraggableTask'

interface Props {
  area: AreaEnum
  tasks: TaskColumnInner_tasks$key
  isViewerMeetingSection?: boolean
  meetingId?: string
}

const TaskColumnInner = memo((props: Props) => {
  const {area, tasks: tasksRef, isViewerMeetingSection, meetingId} = props
  const tasks = useFragment(
    graphql`
      fragment TaskColumnInner_tasks on Task
      @relay(plural: true)
      @argumentDefinitions(meetingId: {type: "ID"}) {
        ...DraggableTask_task @arguments(meetingId: $meetingId)
        id
      }
    `,
    tasksRef
  )
  return tasks.map((task, idx) => (
    <DraggableTask
      key={task.id}
      area={area}
      task={task}
      idx={idx}
      isViewerMeetingSection={isViewerMeetingSection}
      meetingId={meetingId}
    />
  )) as any
})

export default TaskColumnInner
