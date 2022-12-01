import {RecordProxy} from 'relay-runtime'
import {getAscendingIdx, getDescendingIdx} from './addNodeToArray'

export const insertEdgeBefore = (
  connection: RecordProxy,
  newEdge: RecordProxy,
  propName: string
) => {
  const edges = connection.getLinkedRecords('edges')!
  const newName = newEdge.getLinkedRecord('node')?.getValue(propName) as string
  const newEdgeIdx = edges.findIndex((edge) => {
    const edgeName = edge ? (edge.getLinkedRecord('node')?.getValue(propName) as string) : ''
    return edgeName > newName
  })
  const nextEdges =
    newEdgeIdx === -1
      ? edges.concat(newEdge)
      : [...edges.slice(0, newEdgeIdx), newEdge, ...edges.slice(newEdgeIdx)]
  connection.setLinkedRecords(nextEdges, 'edges')
}

export const insertNodeBefore = (nodes: RecordProxy[], newNode: RecordProxy, propName: string) => {
  const newName = newNode.getValue(propName) as string
  const newIdx = nodes.findIndex((node) => {
    const nodeName = node ? (node.getValue(propName) as string) : ''
    return nodeName > newName ? 1 : -1
  })
  return newIdx === -1
    ? nodes.concat(newNode)
    : [...nodes.slice(0, newIdx), newNode, ...nodes.slice(newIdx)]
}

// will build when needed
interface Options {
  isAscending?: boolean | undefined
}
export const insertEdgeAfter = (
  connection: RecordProxy,
  newEdge: RecordProxy,
  sortValue?: string,
  options: Options = {}
) => {
  const {isAscending} = options
  const edges = connection.getLinkedRecords('edges')!
  const nodes = edges.map((edge) => edge.getLinkedRecord('node'))
  const idxFinder = isAscending ? getAscendingIdx : getDescendingIdx
  const newName = sortValue
    ? (newEdge.getLinkedRecord('node')!.getValue(sortValue) as string | number)
    : ''
  const nextIdx = sortValue
    ? idxFinder(newName, nodes, sortValue)
    : isAscending
    ? edges.length - 1
    : 0
  const nextEdges = [...edges.slice(0, nextIdx), newEdge, ...edges.slice(nextIdx)]
  connection.setLinkedRecords(nextEdges, 'edges')
}
