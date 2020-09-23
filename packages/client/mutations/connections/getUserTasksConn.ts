import {ConnectionHandler, RecordProxy} from 'relay-runtime'

const getUserTasksConn = (viewer: RecordProxy, userIds: string[] | null, teamIds: string[] | null, archived: boolean | null) =>

  ConnectionHandler.getConnection(viewer, 'UserColumnsContainer_tasks', {userIds, teamIds, archived})

export default getUserTasksConn
