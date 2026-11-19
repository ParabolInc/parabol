import {forwardRef} from 'react'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import {MenuItem} from '../ui/Menu/MenuItem'
import HighlightedText from './HighlightedText'
import MenuItemAvatar from './MenuItemAvatar'
import TaskServiceIcon from './TaskServiceIcon'

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
      <HighlightedText query={query} text={label} className='truncate' />
    </MenuItem>
  )
})

export default TaskIntegrationMenuItem
