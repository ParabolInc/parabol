import {ConnectionHandler} from 'relay-runtime';

const getNotificationsConn = (viewer) => ConnectionHandler.getConnection(
  viewer,
  'DashboardWrapper_notifications'
);

export default getNotificationsConn;
