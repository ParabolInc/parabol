import {ITask} from 'universal/types/graphql'

const getTaskById = (taskConnection: any) => (taskId: string): ITask | undefined | null => {
  if (!taskConnection.edges) return undefined
  const edge = taskConnection.edges.find((edge) =>
    Boolean(edge && edge.node && edge.node.id === taskId)
  )
  return edge ? edge.node : undefined
}

export default getTaskById
