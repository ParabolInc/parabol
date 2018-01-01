import {ConnectionHandler} from 'relay-runtime';

const getUserProjectsConn = (viewer) => ConnectionHandler.getConnection(
  viewer,
  'UserColumnsContainer_projects'
);

export default getUserProjectsConn;
