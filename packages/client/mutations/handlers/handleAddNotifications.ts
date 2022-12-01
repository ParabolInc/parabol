import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import filterNodesInConn from '../../utils/relay/filterNodesInConn'
import getNotificationsConn from '../connections/getNotificationsConn'
import pluralizeHandler from './pluralizeHandler'

const handleAddNotification = (newNode: RecordProxy | null, store: RecordSourceSelectorProxy) => {
  if (!newNode) return
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
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
