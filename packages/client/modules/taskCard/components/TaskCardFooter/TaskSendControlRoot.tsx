import {Suspense} from 'react'
import type {TaskFooterIntegrateMenuRoot_task$key} from '../../../../__generated__/TaskFooterIntegrateMenuRoot_task.graphql'
import type {TaskSendControlQuery} from '../../../../__generated__/TaskSendControlQuery.graphql'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import TaskSendControl, {taskSendControlQuery} from './TaskSendControl'

interface Props {
  isCardActive: boolean
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenuRoot_task$key
  teamId: string
  useTaskChild: UseTaskChild
}

const TaskSendControlRoot = (props: Props) => {
  const {isCardActive, mutationProps, task, teamId, useTaskChild} = props
  const queryRef = useQueryLoaderNow<TaskSendControlQuery>(taskSendControlQuery, {teamId})
  const placeholder = <div className='h-6 w-6' />
  return (
    <Suspense fallback={placeholder}>
      {queryRef ? (
        <TaskSendControl
          isCardActive={isCardActive}
          mutationProps={mutationProps}
          queryRef={queryRef}
          task={task}
          teamId={teamId}
          useTaskChild={useTaskChild}
        />
      ) : (
        placeholder
      )}
    </Suspense>
  )
}

export default TaskSendControlRoot
