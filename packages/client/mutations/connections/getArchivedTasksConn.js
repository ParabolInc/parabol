import {ConnectionHandler} from 'relay-runtime'

const getArchivedTasksConn = (viewer, teamId) => {
  const connectionFilter = {archived: true}
  if (teamId) connectionFilter['teamId'] = teamId
  return ConnectionHandler.getConnection(viewer, 'TeamArchive_archivedTasks', connectionFilter)
}
export default getArchivedTasksConn
