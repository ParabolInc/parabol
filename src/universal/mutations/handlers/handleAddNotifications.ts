import getNotificationsConn from 'universal/mutations/connections/getNotificationsConn'
import pluralizeHandler from 'universal/mutations/handlers/pluralizeHandler'
import filterNodesInConn from 'universal/utils/relay/filterNodesInConn'
import {ConnectionHandler, RecordProxy, RecordSourceProxy} from 'relay-runtime'

const handleAddNotification = (newNode: RecordProxy | null, store: RecordSourceProxy) => {
  if (!newNode) return
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const conn = getNotificationsConn(viewer)
  if (!conn) return
  const nodeId = newNode.getValue('id')
  const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('id') === nodeId)
  if (matchingNodes.length === 0) {
    const newEdge = ConnectionHandler.createEdge(store, conn, newNode, 'NotificationEdge')
    newEdge.setValue(newNode.getValue('startAt'), 'cursor')
    ConnectionHandler.insertEdgeBefore(conn, newEdge)
  }
}

const handleAddNotifications = pluralizeHandler(handleAddNotification)
export default handleAddNotifications
