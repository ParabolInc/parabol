import {ConnectionHandler, RecordProxy} from 'relay-runtime'

const getUserTasksConn = (viewer: RecordProxy) =>

  ConnectionHandler.getConnection(viewer, 'UserColumnsContainer_tasks')

export default getUserTasksConn
