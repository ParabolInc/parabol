import {ResolversParentTypes, ThreadableResolvers} from '../resolverTypes'

export type ThreadableSource = (ResolversParentTypes['Task'] | ResolversParentTypes['Comment']) & {
  threadParentId: string
  threadSortOrder: number
  replies?: ThreadableSource[]
}

const Threadable: ThreadableResolvers = {
  __resolveType: (type) => {
    if ('status' in type) return 'Task'
    if ('title' in type) return 'Poll'
    return 'Comment'
  },
  createdByUser: ({createdBy}, _args, {dataLoader}) => {
    return createdBy ? dataLoader.get('users').loadNonNull(createdBy) : null
  },
  replies: ({replies}) => replies || []
}

export default Threadable
