import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import getNotificationsConn from '../connections/getNotificationsConn'
import ensureArray from '../../utils/ensureArray'

const handleRemoveNotifications = (
  maybeNotificationIds: string[] | undefined | null,
  store: RecordSourceSelectorProxy
) => {
  if (!maybeNotificationIds) return
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const conn = getNotificationsConn(viewer)
  if (conn) {
    const notificationIds = ensureArray(maybeNotificationIds)
    notificationIds.forEach((deletedId) => {
      ConnectionHandler.deleteNode(conn, deletedId)
    })
  }
}

export default handleRemoveNotifications
