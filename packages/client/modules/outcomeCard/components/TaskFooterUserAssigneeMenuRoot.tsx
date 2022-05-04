import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuProps} from '../../../hooks/useMenu'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {UseTaskChild} from '../../../hooks/useTaskChildFocus'
import {renderLoader} from '../../../utils/relay/renderLoader'
import taskFooterUserAssigneeMenuQuery, {
  TaskFooterUserAssigneeMenuQuery
} from '../../../__generated__/TaskFooterUserAssigneeMenuQuery.graphql'
import {TaskFooterUserAssigneeMenuRoot_task} from '../../../__generated__/TaskFooterUserAssigneeMenuRoot_task.graphql'
import {AreaEnum} from '../../../__generated__/UpdateTaskMutation.graphql'
import TaskFooterUserAssigneeMenu from './OutcomeCardAssignMenu/TaskFooterUserAssigneeMenu'

interface Props {
  area: string
  menuProps: MenuProps
  task: TaskFooterUserAssigneeMenuRoot_task
  useTaskChild: UseTaskChild
}

const TaskFooterUserAssigneeMenuRoot = (props: Props) => {
  const {area, menuProps, task, useTaskChild} = props
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

export default createFragmentContainer(TaskFooterUserAssigneeMenuRoot, {
  task: graphql`
    fragment TaskFooterUserAssigneeMenuRoot_task on Task {
      ...TaskFooterUserAssigneeMenu_task
      team {
        id
      }
    }
  `
})
