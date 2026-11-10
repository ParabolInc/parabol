import {Suspense} from 'react'
import type {TaskFooterIntegrateMenuRoot_task$key} from '../../../../__generated__/TaskFooterIntegrateMenuRoot_task.graphql'
import type {TaskSendControlQuery} from '../../../../__generated__/TaskSendControlQuery.graphql'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import TaskSendButton from './TaskSendButton'
import TaskSendControl, {taskSendControlQuery} from './TaskSendControl'

interface Props {
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenuRoot_task$key
  teamId: string
  useTaskChild: UseTaskChild
}

const TaskSendControlRoot = (props: Props) => {
  const {mutationProps, task, teamId, useTaskChild} = props
  const queryRef = useQueryLoaderNow<TaskSendControlQuery>(taskSendControlQuery, {teamId})
  const placeholder = <TaskSendButton aria-label='Send to a tool' services={[]} disabled />
  return (
    <Suspense fallback={placeholder}>
      {queryRef ? (
        <TaskSendControl
          mutationProps={mutationProps}
          queryRef={queryRef}
          task={task}
          useTaskChild={useTaskChild}
        />
      ) : (
        placeholder
      )}
    </Suspense>
  )
}

export default TaskSendControlRoot
