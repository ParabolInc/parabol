import {ConnectionHandler} from 'relay-runtime';

const getArchivedTasksConn = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamArchive_archivedTasks',
  {teamId}
);

export default getArchivedTasksConn;
