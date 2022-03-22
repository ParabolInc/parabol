import React, {Suspense} from 'react'
import taskFooterTeamAssigneeMenuQuery, {
  TaskFooterTeamAssigneeMenuRootQuery
} from '~/__generated__/TaskFooterTeamAssigneeMenuRootQuery.graphql'
import {MenuProps} from '../../../hooks/useMenu'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {UseTaskChild} from '../../../hooks/useTaskChildFocus'
import TaskFooterTeamAssigneeMenu from './OutcomeCardAssignMenu/TaskFooterTeamAssigneeMenu'

interface Props {
  menuProps: MenuProps
  task: any
  useTaskChild: UseTaskChild
}

const TaskFooterTeamAssigneeMenuRoot = (props: Props) => {
  const {menuProps, task, useTaskChild} = props
  useTaskChild('teamAssignee')
  const queryRef = useQueryLoaderNow<TaskFooterTeamAssigneeMenuRootQuery>(
    taskFooterTeamAssigneeMenuQuery,
    {}
  )
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <TaskFooterTeamAssigneeMenu queryRef={queryRef} menuProps={menuProps} task={task} />
      )}
    </Suspense>
  )
}

export default TaskFooterTeamAssigneeMenuRoot
