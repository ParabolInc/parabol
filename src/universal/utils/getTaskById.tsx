import ITask = GQL.ITask
import ITaskConnection = GQL.ITaskConnection

const getTaskById = (taskConnection: ITaskConnection) => (taskId: string): ITask | undefined => {
  if (!taskConnection.edges) return undefined
  const edge = taskConnection.edges.find((edge) =>
    Boolean(edge && edge.node && edge.node.id === taskId)
  )
  return edge ? edge.node : undefined
}

export default getTaskById
