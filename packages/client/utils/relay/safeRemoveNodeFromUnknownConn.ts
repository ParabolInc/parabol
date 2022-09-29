/*
 * Sometimes a node may exist in 1 of many different connections.
 * This removes it from the first one it is found in
 */
import {RecordSourceSelectorProxy} from 'relay-runtime'
import findConnectionWithNodeId from './findConnectionWithNodeId'
import getAllConnections from './getAllConnections'
import safeRemoveNodeFromConn from './safeRemoveNodeFromConn'

const safeRemoveNodeFromUnknownConn = (
  store: RecordSourceSelectorProxy,
  parentId: string,
  connectionName: string,
  nodeId: string
) => {
  if (!nodeId) return
  const teamConnections = getAllConnections(store, parentId, connectionName)
  const conn = findConnectionWithNodeId(teamConnections, nodeId)
  safeRemoveNodeFromConn(nodeId, conn)
}

export default safeRemoveNodeFromUnknownConn
