import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {MenuItem} from '~/ui/Menu/MenuItem'
import type {TaskFooterTagMenuStatusItem_task$key} from '../../../../__generated__/TaskFooterTagMenuStatusItem_task.graphql'
import MenuItemDot from '../../../../components/MenuItemDot'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import {taskStatusColors, taskStatusLabels} from '../../../../utils/taskStatus'

interface Props {
  area: AreaEnum
  status: TaskStatusEnum
  task: TaskFooterTagMenuStatusItem_task$key
}

const TaskFooterTagMenuStatusItem = (props: Props) => {
  const {area, status, task: taskRef} = props
  const task = useFragment(
    graphql`
      fragment TaskFooterTagMenuStatusItem_task on Task {
        id
        status
      }
    `,
    taskRef
  )
  const atmosphere = useAtmosphere()
  const color = taskStatusColors[status]
  const label = taskStatusLabels[status]
  const handleTaskUpdateFactory = () => {
    if (status === task.status) {
      return
    }
    const updatedTask = {
      id: task.id,
      status
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
  }
  return (
    <MenuItem onSelect={handleTaskUpdateFactory}>
      <MenuItemDot color={color} />
      {`Move to ${label}`}
    </MenuItem>
  )
}

export default TaskFooterTagMenuStatusItem
