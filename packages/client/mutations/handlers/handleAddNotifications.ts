import getNotificationsConn from '../connections/getNotificationsConn'
import pluralizeHandler from './pluralizeHandler'
import filterNodesInConn from '../../utils/relay/filterNodesInConn'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {insertNodeBeforeInConn} from '~/utils/relay/insertNode'

const handleAddNotification = (newNode: RecordProxy | null, store: RecordSourceSelectorProxy) => {
  if (!newNode) return
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer) return
  const conn = getNotificationsConn(viewer)
  if (!conn) return
  const nodeId = newNode.getValue('id')
  const matchingNodes = filterNodesInConn(conn, (node) => node.getValue('id') === nodeId)
  if (matchingNodes.length > 0) return
  const cursorValue = newNode.getValue('startAt') as string
  insertNodeBeforeInConn(conn, newNode, store, 'NotificationEdge', cursorValue)
}

const handleAddNotifications = pluralizeHandler(handleAddNotification)
export default handleAddNotifications
