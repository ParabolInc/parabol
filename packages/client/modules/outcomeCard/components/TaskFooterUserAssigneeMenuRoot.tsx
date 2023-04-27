import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {MenuProps} from '../../../hooks/useMenu'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {UseTaskChild} from '../../../hooks/useTaskChildFocus'
import {renderLoader} from '../../../utils/relay/renderLoader'
import taskFooterUserAssigneeMenuQuery, {
  TaskFooterUserAssigneeMenuQuery
} from '../../../__generated__/TaskFooterUserAssigneeMenuQuery.graphql'
import {TaskFooterUserAssigneeMenuRoot_task$key} from '../../../__generated__/TaskFooterUserAssigneeMenuRoot_task.graphql'
import {AreaEnum} from '../../../__generated__/UpdateTaskMutation.graphql'
import TaskFooterUserAssigneeMenu from './OutcomeCardAssignMenu/TaskFooterUserAssigneeMenu'

interface Props {
  area: string
  menuProps: MenuProps
  task: TaskFooterUserAssigneeMenuRoot_task$key
  useTaskChild: UseTaskChild
}

const TaskFooterUserAssigneeMenuRoot = (props: Props) => {
  const {area, menuProps, task: taskRef, useTaskChild} = props
  const task = useFragment(
    graphql`
      fragment TaskFooterUserAssigneeMenuRoot_task on Task {
        ...TaskFooterUserAssigneeMenu_task
        team {
          id
        }
      }
    `,
    taskRef
  )
  const {team} = task
  const {id: teamId} = team
  useTaskChild('userAssignee')
  const queryRef = useQueryLoaderNow<TaskFooterUserAssigneeMenuQuery>(
    taskFooterUserAssigneeMenuQuery,
    {teamId}
  )
  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && (
        <TaskFooterUserAssigneeMenu
          queryRef={queryRef}
          area={area as AreaEnum}
          menuProps={menuProps}
          task={task}
        />
      )}
    </Suspense>
  )
}

export default TaskFooterUserAssigneeMenuRoot
