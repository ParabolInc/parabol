import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import getNodeById from '../../utils/relay/getNodeById'
import {insertEdgeAfter} from '../../utils/relay/insertEdge'

const safePutNodeInConn = (
  conn: RecordProxy | null | undefined,
  node: RecordProxy,
  store: RecordSourceSelectorProxy,
  sortValue = 'updatedAt',
  isAscending?: boolean
) => {
  const nodeId = node.getDataID()
  if (conn && !getNodeById(nodeId, conn)) {
    const newEdge = ConnectionHandler.createEdge(store, conn, node, 'TaskEdge')
    newEdge.setValue(node.getValue(sortValue), 'cursor')
    const options = {isAscending}
    insertEdgeAfter(conn, newEdge, sortValue, options)
  }
}

export default safePutNodeInConn
