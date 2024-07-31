import {ThreadableResolvers} from '../resolverTypes'

const Threadable: ThreadableResolvers = {
  __resolveType: (type) => {
    if ('status' in type) return 'Task'
    if ('title' in type) return 'Poll'
    return 'Comment'
  },
  createdByUser: ({createdBy}, _args, {dataLoader}) => {
    return createdBy ? dataLoader.get('users').loadNonNull(createdBy) : null
  }
}

export default Threadable
