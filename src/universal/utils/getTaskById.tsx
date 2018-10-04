import {ITask, ITaskConnection} from 'universal/types/graphql'

const getTaskById = (taskConnection: ITaskConnection) => (
  taskId: string
): ITask | undefined | null => {
  if (!taskConnection.edges) return undefined
  const edge = taskConnection.edges.find((edge) =>
    Boolean(edge && edge.node && edge.node.id === taskId)
  )
  return edge ? edge.node : undefined
}

export default getTaskById
