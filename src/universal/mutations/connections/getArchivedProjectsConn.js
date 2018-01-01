import {ConnectionHandler} from 'relay-runtime';

const getArchivedProjectsConn = (viewer, teamId) => ConnectionHandler.getConnection(
  viewer,
  'TeamArchive_archivedProjects',
  {teamId}
);

export default getArchivedProjectsConn;
