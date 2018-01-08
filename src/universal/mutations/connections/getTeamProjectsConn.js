import {ConnectionHandler} from 'relay-runtime';

const getTeamProjectsConn = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamColumnsContainer_projects',
  {teamId}
);

export default getTeamProjectsConn;

