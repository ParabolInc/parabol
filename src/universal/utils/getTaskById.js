/**
 * Finds a Task from a paginated array of Tasks.
 *
 * @flow
 */

import type {Task, TaskConnection} from 'universal/types/schema.flow'

const getTaskById = (taskConnection: TaskConnection) => (taskId: string): ?Task => {
  if (!taskConnection.edges) return undefined
  const edge = taskConnection.edges.find((edge) => edge && edge.node && edge.node.id === taskId)
  return edge && edge.node
}

export default getTaskById
