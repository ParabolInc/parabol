import {ConnectionHandler} from 'relay-runtime'

const getTeamTasksConn = (team) =>
  ConnectionHandler.getConnection(team, 'TeamColumnsContainer_tasks')

export default getTeamTasksConn
