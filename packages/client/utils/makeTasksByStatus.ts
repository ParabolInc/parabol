import {TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {columnArray} from './constants'

// sorts post-split to be a little more efficient
interface Task {
  status: TaskStatusEnum
  sortOrder: number
}

export default function makeTasksByStatus<T extends Task>(tasks: readonly T[]) {
  const tasksByStatus = {
    active: [],
    stuck: [],
    done: [],
    future: []
  } as Record<TaskStatusEnum, T[]>
  tasks.forEach((task) => {
    tasksByStatus[task.status].push(task)
  })

  // sort after for performance
  columnArray.forEach((status) => {
    tasksByStatus[status].sort((a, b) => b.sortOrder - a.sortOrder)
  })
  return tasksByStatus
}
