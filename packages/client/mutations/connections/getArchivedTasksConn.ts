import {ConnectionHandler} from 'relay-runtime'

const getArchivedTasksConn = (viewer, teamId?) => {
  const connectionFilter = {} as {teamId?: string}
  if (teamId) connectionFilter.teamId = teamId
  return ConnectionHandler.getConnection(viewer, 'TeamArchive_tasks', connectionFilter)
}
export default getArchivedTasksConn
