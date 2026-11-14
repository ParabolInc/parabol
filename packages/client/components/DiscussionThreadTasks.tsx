import type {NullableTask_task$key} from '../__generated__/NullableTask_task.graphql'
import {Button} from '../ui/Button/Button'
import plural from '../utils/plural'
import NullableTask from './NullableTask/NullableTask'

interface Props {
  tasks: readonly {id: string; task: NullableTask_task$key}[]
  hiddenCommentCount: number
  onAddTask: () => void
  onShowAll: () => void
}

const DiscussionThreadTasks = (props: Props) => {
  const {tasks, hiddenCommentCount, onAddTask, onShowAll} = props
  if (tasks.length === 0) {
    return (
      <div className='m-auto px-6 py-3 text-center text-fg-secondary text-sm'>
        No tasks from this topic yet.
        <Button variant='outline' size='sm' className='mx-auto mt-2 flex' onClick={onAddTask}>
          Add a task
        </Button>
      </div>
    )
  }
  return (
    <div className='flex flex-col gap-4 pt-4 pr-2 pb-4 pl-13'>
      {tasks.map(({id, task}) => (
        <NullableTask key={id} className='max-w-[296px]' area='meeting' task={task} />
      ))}
      {hiddenCommentCount > 0 && (
        <div className='text-[13px] text-fg-muted leading-[18px]'>
          {hiddenCommentCount} {plural(hiddenCommentCount, 'comment')} hidden.{' '}
          <button type='button' className='font-semibold text-accent-active' onClick={onShowAll}>
            Show all
          </button>
        </div>
      )}
    </div>
  )
}

export default DiscussionThreadTasks
