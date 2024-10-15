import {Comment, Task} from '../../postgres/types'
import {ThreadableSource} from '../public/types/Threadable'
import {DataLoaderWorker} from './../graphql'

const resolveThreadableConnection = async (
  discussionId: string,
  {dataLoader}: {dataLoader: DataLoaderWorker}
) => {
  const [comments, tasks] = await Promise.all([
    dataLoader.get('commentsByDiscussionId').load(discussionId),
    dataLoader.get('tasksByDiscussionId').load(discussionId)
    // dataLoader.get('pollsByDiscussionId').load(discussionId)
  ])
  const threadables = [...comments, ...tasks] as ThreadableSource[]
  const threadablesByParentId = {} as {[parentId: string]: ThreadableSource[]}

  const rootThreadables = [] as ThreadableSource[]
  const filteredThreadables = [] as ThreadableSource[]

  threadables.forEach((threadable) => {
    const {threadParentId} = threadable
    if (!threadParentId) {
      rootThreadables.push(threadable)
    } else if ((threadable as Task).status || (threadable as Comment).isActive) {
      // if it's a task or it's a non-deleted comment, add it
      threadablesByParentId[threadParentId] = threadablesByParentId[threadParentId] || []
      threadablesByParentId[threadParentId]!.push(threadable)
    }
  })

  rootThreadables.sort((a, b) => (a.threadSortOrder < b.threadSortOrder ? -1 : 1))
  rootThreadables.forEach((threadable) => {
    const {id: threadableId} = threadable
    const replies = threadablesByParentId[threadableId]
    const isActive = (threadable as Task).status || (threadable as Comment).isActive
    // (threadable as Poll).deletedAt === null
    if (!isActive && !replies) return
    filteredThreadables.push(threadable)
    if (replies) {
      replies.sort((a, b) => (a.threadSortOrder < b.threadSortOrder ? -1 : 1))
      threadable.replies = replies
    } else {
      threadable.replies = []
    }
  })

  const edges = filteredThreadables.map((node) => ({
    cursor: node.createdAt.toISOString(),
    node
  }))

  const lastEdge = edges[edges.length - 1]
  return {
    edges,
    pageInfo: {
      endCursor: lastEdge?.cursor,
      hasNextPage: false,
      hasPreviousPage: false
    }
  }
}

export default resolveThreadableConnection
