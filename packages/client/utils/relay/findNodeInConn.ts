import {RecordProxy} from 'relay-runtime'

const findNodeInConn = (connection: RecordProxy, nodeId: string) => {
  if (!connection) return null
  const edges = connection.getLinkedRecords('edges')
  if (!edges) return null
  for (let ii = 0; ii < edges.length; ii++) {
    const edge = edges[ii]
    if (!edge) continue
    const node = edge.getLinkedRecord('node')
    if (!node) continue
    if (node.getDataID() === nodeId) {
      return node
    }
  }
  return null
}

export default findNodeInConn
