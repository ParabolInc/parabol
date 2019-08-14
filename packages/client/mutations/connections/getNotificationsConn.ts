import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getNotificationsConn = (viewer: ReadOnlyRecordProxy) =>
  ConnectionHandler.getConnection(viewer, 'DashboardWrapper_notifications')

export default getNotificationsConn
