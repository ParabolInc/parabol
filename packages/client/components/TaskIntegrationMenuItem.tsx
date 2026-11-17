import {forwardRef} from 'react'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import {MenuItem} from '../ui/Menu/MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import TaskServiceIcon from './TaskServiceIcon'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  label: string
  onClick: () => void
  service: TaskServiceEnum
  query: string
}

const TaskIntegrationMenuItem = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {label, onClick, service, query} = props
  return (
    <MenuItem ref={ref} onClick={onClick}>
      <MenuItemAvatar>
        <TaskServiceIcon service={service} />
      </MenuItemAvatar>
      <TypeAheadLabel query={query} label={label} />
    </MenuItem>
  )
})

export default TaskIntegrationMenuItem
