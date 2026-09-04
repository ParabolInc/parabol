import {Suspense} from 'react'
import taskFooterTeamAssigneeMenuQuery, {
  type TaskFooterTeamAssigneeMenuQuery
} from '~/__generated__/TaskFooterTeamAssigneeMenuQuery.graphql'
import MockFieldList from '../../../components/MockFieldList'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import type {UseTaskChild} from '../../../hooks/useTaskChildFocus'
import TaskFooterTeamAssigneeMenu, {
  type PendingTeamAssignment
} from './OutcomeCardAssignMenu/TaskFooterTeamAssigneeMenu'

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
    <Suspense fallback={<MockFieldList />}>
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
