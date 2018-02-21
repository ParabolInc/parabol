import {ConnectionHandler} from 'relay-runtime';

const getTeamTasksConn = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamColumnsContainer_tasks',
  {teamId}
);

export default getTeamTasksConn;

