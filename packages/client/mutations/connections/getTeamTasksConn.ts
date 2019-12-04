import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getTeamTasksConn = (team: ReadOnlyRecordProxy | null | undefined) => {
  if (team) {
    return ConnectionHandler.getConnection(team, 'TeamColumnsContainer_tasks')
  }
  return null
}

export default getTeamTasksConn
