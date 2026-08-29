import {forwardRef} from 'react'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import MenuItem from './MenuItem'
import MenuItemAvatar from './MenuItemAvatar'
import MenuItemLabel from './MenuItemLabel'
import TaskServiceIcon from './TaskServiceIcon'
import TypeAheadLabel from './TypeAheadLabel'

interface Props {
  label: string
  onClick: () => void
  service: TaskServiceEnum
  query: string
}

const TaskIntegrationMenuItem = forwardRef((props: Props, ref) => {
  const {label, onClick, service, query} = props
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemAvatar>
            <TaskServiceIcon service={service} />
          </MenuItemAvatar>
          <TypeAheadLabel query={query} label={label} />
        </MenuItemLabel>
      }
      onClick={onClick}
    />
  )
})

export default TaskIntegrationMenuItem
