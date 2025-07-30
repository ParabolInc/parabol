import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import taskFooterUserAssigneeMenuQuery, {
  type TaskFooterUserAssigneeMenuQuery
} from '../../../__generated__/TaskFooterUserAssigneeMenuQuery.graphql'
import type {TaskFooterUserAssigneeMenuRoot_task$key} from '../../../__generated__/TaskFooterUserAssigneeMenuRoot_task.graphql'
import type {AreaEnum} from '../../../__generated__/UpdateTaskMutation.graphql'
import type {MenuProps} from '../../../hooks/useMenu'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import type {UseTaskChild} from '../../../hooks/useTaskChildFocus'
import {Loader} from '../../../utils/relay/renderLoader'
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
    <Suspense fallback={<Loader />}>
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
