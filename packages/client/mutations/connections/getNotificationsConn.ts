import {ConnectionHandler, type ReadOnlyRecordProxy} from 'relay-runtime'

const getNotificationsConn = (viewer: ReadOnlyRecordProxy) =>
  ConnectionHandler.getConnection(viewer, 'NotificationDropdown_notifications')

export default getNotificationsConn
