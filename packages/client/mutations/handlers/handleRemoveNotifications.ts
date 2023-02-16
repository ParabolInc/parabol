import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import filterNodesInConn from '../../utils/relay/filterNodesInConn'
import getNotificationsConn from '../connections/getNotificationsConn'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveNotification = (notificationId: string, store: RecordSourceSelectorProxy) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const conn = getNotificationsConn(viewer)
  if (!conn) return
  const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('id') === notificationId)
  if (matchingNodes.length) {
    ConnectionHandler.deleteNode(conn, notificationId)
  }
}

const handleRemoveNotifications = pluralizeHandler(handleRemoveNotification)
export default handleRemoveNotifications
