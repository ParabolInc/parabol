import {Poll} from '../../postgres/queries/getPollsByIds'
import Comment from './Comment'
import Task from './Task'

export type Threadable = (Task | Comment | Poll) & {
  threadParentId: string
  threadSortOrder: number
}
