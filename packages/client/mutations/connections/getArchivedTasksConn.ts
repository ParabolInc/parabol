import {ConnectionHandler, RecordProxy} from 'relay-runtime'

const getArchivedTasksConn = (viewer: RecordProxy, userIds: string[] | null, teamIds: string[] | null, archived: boolean | null) =>
  ConnectionHandler.getConnection(viewer, 'TeamArchive_tasks', {userIds, teamIds, archived})

export default getArchivedTasksConn
