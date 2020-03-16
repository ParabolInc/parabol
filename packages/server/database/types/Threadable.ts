import Comment from './Comment'
import Task from './Task'

export type Threadable = (Task | Comment) & {
  threadSortOrder: number
}
