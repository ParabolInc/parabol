import React, {Suspense} from 'react'
import taskFooterTeamAssigneeMenuQuery, {
  TaskFooterTeamAssigneeMenuQuery
} from '~/__generated__/TaskFooterTeamAssigneeMenuQuery.graphql'
import {MenuProps} from '../../../hooks/useMenu'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {UseTaskChild} from '../../../hooks/useTaskChildFocus'
import TaskFooterTeamAssigneeMenu from './OutcomeCardAssignMenu/TaskFooterTeamAssigneeMenu'
import MockFieldList from '../../../components/MockFieldList'

interface Props {
  menuProps: MenuProps
  task: any
  useTaskChild: UseTaskChild
}

const TaskFooterTeamAssigneeMenuRoot = (props: Props) => {
  const {menuProps, task, useTaskChild} = props
  useTaskChild('teamAssignee')
  const queryRef = useQueryLoaderNow<TaskFooterTeamAssigneeMenuQuery>(
    taskFooterTeamAssigneeMenuQuery,
    {}
  )
  return (
    <Suspense fallback={MockFieldList}>
      {queryRef && (
        <TaskFooterTeamAssigneeMenu queryRef={queryRef} menuProps={menuProps} task={task} />
      )}
    </Suspense>
  )
}

export default TaskFooterTeamAssigneeMenuRoot
