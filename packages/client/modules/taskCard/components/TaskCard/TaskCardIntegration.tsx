import graphql from 'babel-plugin-relay/macro'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import type {TaskCardIntegration_task$key} from '~/__generated__/TaskCardIntegration_task.graphql'
import IntegratedTaskContent from '../../../../components/IntegratedTaskContent'
import TaskIntegrationLink from '../../../../components/TaskIntegrationLink'
import isTaskArchived from '../../../../utils/isTaskArchived'

interface Props {
  task: TaskCardIntegration_task$key
  children: ReactNode
}

const TaskCardIntegration = (props: Props) => {
  const {task: taskRef, children} = props
  const task = useFragment(
    graphql`
      fragment TaskCardIntegration_task on Task {
        id
        status
        tags
        ...IntegratedTaskContent_task
        integration {
          ...TaskIntegrationLink_integration
        }
      }
    `,
    taskRef
  )
  if (!task.integration) return children
  return (
    <>
      <IntegratedTaskContent task={task} />
      <TaskIntegrationLink
        integration={task.integration}
        taskId={task.id}
        isDone={task.status === 'done'}
        isArchived={isTaskArchived(task.tags)}
      />
    </>
  )
}

export default TaskCardIntegration
