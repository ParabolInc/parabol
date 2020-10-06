import {Threshold} from 'parabol-client/types/constEnums'
import Task from '../../../database/types/Task'

const connectionFromTasks = (
  tasks: Task[],
  first: number = Threshold.MAX_NUMBER_OF_TASKS_TO_LOAD
) => {
  const nodes = tasks.slice(0, first)
  const edges = nodes.map((node) => ({
    cursor: node.updatedAt,
    node
  }))
  const firstEdge = edges[0]
  return {
    edges,
    pageInfo: {
      startCursor: firstEdge && firstEdge.cursor,
      endCursor: firstEdge ? edges[edges.length - 1].cursor : new Date(),
      hasNextPage: tasks.length > nodes.length,
      edgesReturned: edges.length
    }
  }
}

export default connectionFromTasks
