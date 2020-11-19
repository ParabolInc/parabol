import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

export const insertNodeBeforeInConn = (
  conn: RecordProxy,
  node: RecordProxy,
  store: RecordSourceSelectorProxy,
  type: string,
  cursorValue: string = new Date().toISOString()
) => {
  const newEdge = ConnectionHandler.createEdge(store, conn, node, type)
  newEdge.setValue(cursorValue, 'cursor')
  ConnectionHandler.insertEdgeBefore(conn, newEdge)
}
