import {TaskFooterTagMenuStatusItem_task} from '__generated__/TaskFooterTagMenuStatusItem_task.graphql'
import React, {forwardRef} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import MenuItem from 'universal/components/MenuItem'
import MenuItemDot from 'universal/components/MenuItemDot'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import labels from 'universal/styles/theme/labels'
import {AreaEnum, TaskStatusEnum} from 'universal/types/graphql'

interface Props {
  area: AreaEnum
  status: TaskStatusEnum
  task: TaskFooterTagMenuStatusItem_task
}

const TaskFooterTagMenuStatusItem = forwardRef((props: Props, ref) => {
  const {area, status, task} = props
  const atmosphere = useAtmosphere()
  const {color, label} = labels.taskStatus[status]
  const handleTaskUpdateFactory = () => {
    if (status === task.status) {
      return
    }
    const updatedTask = {
      id: task.id,
      status
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area})
  }
  return (
    <MenuItem
      ref={ref}
      key={status}
      label={
        <MenuItemLabel>
          <MenuItemDot color={color} />
          {`Move to ${label}`}
        </MenuItemLabel>
      }
      onClick={handleTaskUpdateFactory}
    />
  )
})

export default createFragmentContainer(
  TaskFooterTagMenuStatusItem,
  graphql`
    fragment TaskFooterTagMenuStatusItem_task on Task {
      id
      status
    }
  `
)
