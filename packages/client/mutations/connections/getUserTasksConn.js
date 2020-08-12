import {ConnectionHandler} from 'relay-runtime'

const getUserTasksConn = (viewer) =>
  ConnectionHandler.getConnection(viewer, 'UserColumnsContainer_tasks', {includeTeamMembers: false})

export default getUserTasksConn
