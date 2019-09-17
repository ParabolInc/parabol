import {TaskFooterTagMenuStatusItem_task} from '../../../../__generated__/TaskFooterTagMenuStatusItem_task.graphql'
import React, {forwardRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import MenuItem from '../../../../components/MenuItem'
import MenuItemDot from '../../../../components/MenuItemDot'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import {PALETTE} from '../../../../styles/paletteV2'
import {TaskStatus, TaskStatusLabel} from '../../../../types/constEnums'
import {AreaEnum, TaskStatusEnum} from '../../../../types/graphql'

interface Props {
  area: AreaEnum
  status: TaskStatusEnum
  task: TaskFooterTagMenuStatusItem_task
}

const taskStatusColors = {
  [TaskStatus.DONE]: PALETTE.STATUS_DONE,
  [TaskStatus.ACTIVE]: PALETTE.STATUS_ACTIVE,
  [TaskStatus.STUCK]: PALETTE.STATUS_STUCK,
  [TaskStatus.FUTURE]: PALETTE.STATUS_FUTURE,
  [TaskStatus.ARCHIVED]: PALETTE.STATUS_ARCHIVED,
  [TaskStatus.PRIVATE]: PALETTE.STATUS_PRIVATE
}

const taskStatusLabels = {
  [TaskStatus.DONE]: TaskStatusLabel.DONE,
  [TaskStatus.ACTIVE]: TaskStatusLabel.ACTIVE,
  [TaskStatus.STUCK]: TaskStatusLabel.STUCK,
  [TaskStatus.FUTURE]: TaskStatusLabel.FUTURE,
  [TaskStatus.ARCHIVED]: TaskStatusLabel.ARCHIVED,
  [TaskStatus.PRIVATE]: TaskStatusLabel.PRIVATE
}

const TaskFooterTagMenuStatusItem = forwardRef((props: Props, ref) => {
  const {area, status, task} = props
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

export default createFragmentContainer(TaskFooterTagMenuStatusItem, {
  task: graphql`
    fragment TaskFooterTagMenuStatusItem_task on Task {
      id
      status
    }
  `
})
