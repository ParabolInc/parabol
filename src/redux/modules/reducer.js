import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import appInfo from './appInfo';
import auth from './auth';
import meeting from './meeting';
import socket from './socket';

export default combineReducers({
  appInfo: appInfo,
  auth: auth,
  router: routerStateReducer,
  meeting: meeting,
  socket: socket
});
