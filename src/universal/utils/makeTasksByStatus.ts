import {columnArray} from './constants'
import {TaskStatusEnum} from 'universal/types/graphql'

// sorts post-split to be a little more efficient
interface Task {
  status: string
  sortOrtder: number
}

export default function makeTasksByStatus<T extends Task> (tasks: ReadonlyArray<T>) {
  const tasksByStatus = {
    [TaskStatusEnum.active]: [] as T[],
    [TaskStatusEnum.stuck]: [] as T[],
    [TaskStatusEnum.done]: [] as T[],
    [TaskStatusEnum.future]: [] as T[]
  }
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    if (!tasksByStatus[task.status]) debugger
    tasksByStatus[task.status].push(task)
  }

  // sort after for performance
  for (let i = 0; i < columnArray.length; i++) {
    const status = columnArray[i]
    tasksByStatus[status].sort((a, b) => b.sortOrder - a.sortOrder)
  }
  return tasksByStatus
}
