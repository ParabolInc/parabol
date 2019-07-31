/*
 * Sometimes a node may exist in 1 of many different connections.
 * This removes it from the first one it is found in
 */
import getAllConnections from './getAllConnections'
import findConnectionWithNodeId from './findConnectionWithNodeId'
import safeRemoveNodeFromConn from './safeRemoveNodeFromConn'
import {RecordSourceSelectorProxy} from 'relay-runtime'

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
