import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getTeamTasksConn = (team: ReadOnlyRecordProxy | null) => {
  if (team) {
    return ConnectionHandler.getConnection(team, 'TeamColumnsContainer_tasks')
  }
}

export default getTeamTasksConn
