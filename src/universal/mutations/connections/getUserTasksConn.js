import {ConnectionHandler} from 'relay-runtime';

const getUserTasksConn = (viewer) => ConnectionHandler.getConnection(
  viewer,
  'UserColumnsContainer_tasks'
);

export default getUserTasksConn;
