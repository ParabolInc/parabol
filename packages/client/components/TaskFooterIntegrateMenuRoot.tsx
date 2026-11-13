import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {type PreloadedQuery, useFragment} from 'react-relay'
import type {TaskFooterIntegrateMenuQuery} from '../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import type {TaskFooterIntegrateMenuRoot_task$key} from '../__generated__/TaskFooterIntegrateMenuRoot_task.graphql'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import type {UseTaskChild} from '../hooks/useTaskChildFocus'
import MenuSkeletonRows from '../ui/Menu/MenuSkeletonRows'
import TaskFooterIntegrateMenu from './TaskFooterIntegrateMenu'

interface Props {
  mutationProps: MenuMutationProps
  queryRef: PreloadedQuery<TaskFooterIntegrateMenuQuery> | null | undefined
  task: TaskFooterIntegrateMenuRoot_task$key
  useTaskChild: UseTaskChild
}

const TaskFooterIntegrateMenuRoot = (props: Props) => {
  const {mutationProps, queryRef, task: taskRef, useTaskChild} = props
  const task = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuRoot_task on Task {
        ...TaskFooterIntegrateMenu_task
      }
    `,
    taskRef
  )
  useTaskChild('integrate')
  const skeleton = (
    <div aria-busy='true' aria-label='Loading where this task can be sent'>
      <div className='mx-4 mt-3 mb-2 h-3 w-1/2 animate-pulse rounded-sm bg-surface-well' />
      <div className='mx-2 my-2 h-8 animate-pulse rounded-md bg-surface-well' />
      <MenuSkeletonRows count={3} />
    </div>
  )
  return (
    <Suspense fallback={skeleton}>
      {queryRef ? (
        <TaskFooterIntegrateMenu queryRef={queryRef} mutationProps={mutationProps} task={task} />
      ) : (
        skeleton
      )}
    </Suspense>
  )
}

export default TaskFooterIntegrateMenuRoot
