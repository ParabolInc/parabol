import Comment from './Comment'
import Task from './Task'

export type Threadable = (Task | Comment) & {
  threadParentId: string
  threadSortOrder: number
  replies?: Threadable[]
}
