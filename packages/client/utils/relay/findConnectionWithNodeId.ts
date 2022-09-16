import {RecordProxy} from 'relay-runtime'
import findNodeInConn from './findNodeInConn'

/*
 * Given that a nodeId only exists in 1 of many connections
 * Find which connection it resides in
 */
const findConnectionWithNodeId = (connections: RecordProxy[], nodeId: string) => {
  for (let ii = 0; ii < connections.length; ii++) {
    const connection = connections[ii]!
    const node = findNodeInConn(connection, nodeId)
    if (node) return connection
  }
  return undefined
}

export default findConnectionWithNodeId
