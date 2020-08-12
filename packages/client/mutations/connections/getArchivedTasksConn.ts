import {ConnectionHandler} from 'relay-runtime'

const getArchivedTasksConn = (viewer, teamId?) => {
  const connectionFilter = {} as {teamIds?: [string]}
  if (teamId) connectionFilter.teamIds = [teamId]
  return ConnectionHandler.getConnection(viewer, 'TeamArchive_tasks', connectionFilter)
}
export default getArchivedTasksConn
