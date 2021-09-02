import Comment from '../../database/types/Comment'
import TaskDB from '../../database/types/Task'
import {Threadable} from '../../database/types/Threadable'

const resolveThreadableConnection = async (discussionId, {dataLoader}) => {
  const [comments, tasks] = await Promise.all([
    dataLoader.get('commentsByDiscussionId').load(discussionId),
    dataLoader.get('tasksByDiscussionId').load(discussionId)
  ])
  const threadables = [...comments, ...tasks] as Threadable[]
  const threadablesByParentId = {} as {[parentId: string]: Threadable[]}

  const rootThreadables = [] as Threadable[]
  const filteredThreadables = [] as Threadable[]

  threadables.forEach((threadable) => {
    const {threadParentId} = threadable
    if (!threadParentId) {
      rootThreadables.push(threadable)
    } else if ((threadable as TaskDB).status || (threadable as Comment).isActive) {
      // if it's a task or it's a non-deleted comment, add it
      threadablesByParentId[threadParentId] = threadablesByParentId[threadParentId] || []
      threadablesByParentId[threadParentId].push(threadable)
    }
  })

  rootThreadables.sort((a, b) => (a.threadSortOrder < b.threadSortOrder ? -1 : 1))
  rootThreadables.forEach((threadable) => {
    const {id: threadableId} = threadable
    const replies = threadablesByParentId[threadableId]
    const isActive = (threadable as TaskDB).status || (threadable as Comment).isActive
    if (!isActive && !replies) return
    filteredThreadables.push(threadable)
    if (replies) {
      replies.sort((a, b) => (a.threadSortOrder < b.threadSortOrder ? -1 : 1))
      ;(threadable as any).replies = replies
    }
  })

  const edges = filteredThreadables.map((node) => ({
    cursor: node.createdAt,
    node
  }))

  const lastEdge = edges[edges.length - 1]
  return {
    edges,
    pageInfo: {
      endCursor: lastEdge?.cursor,
      hasNextPage: false
    }
  }
}

export default resolveThreadableConnection
