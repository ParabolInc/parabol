import {Suspense} from 'react'
import taskFooterTeamAssigneeMenuQuery, {
  type TaskFooterTeamAssigneeMenuQuery
} from '~/__generated__/TaskFooterTeamAssigneeMenuQuery.graphql'
import MockFieldList from '../../../components/MockFieldList'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import type {UseTaskChild} from '../../../hooks/useTaskChildFocus'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import TaskFooterTeamAssigneeMenu, {
  type PendingTeamAssignment
} from './TaskCardAssignMenu/TaskFooterTeamAssigneeMenu'

interface Props {
  task: any
  useTaskChild: UseTaskChild
  onRequestIntegration: (pending: PendingTeamAssignment) => void
}

const TaskFooterTeamAssigneeMenuRoot = (props: Props) => {
  const {task, useTaskChild, onRequestIntegration} = props
  useTaskChild('teamAssignee')
  const queryRef = useQueryLoaderNow<TaskFooterTeamAssigneeMenuQuery>(
    taskFooterTeamAssigneeMenuQuery,
    {}
  )
  return (
    <Suspense
      fallback={
        <MenuContent align='start'>
          <MockFieldList />
        </MenuContent>
      }
    >
      {queryRef && (
        <TaskFooterTeamAssigneeMenu
          queryRef={queryRef}
          task={task}
          onRequestIntegration={onRequestIntegration}
        />
      )}
    </Suspense>
  )
}

export default TaskFooterTeamAssigneeMenuRoot
