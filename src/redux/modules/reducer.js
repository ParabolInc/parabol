import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import auth from './auth';
import meeting from './meeting';
import socket from './socket';

export default combineReducers({
  auth: auth,
  router: routerStateReducer,
  meeting: meeting,
  socket: socket
});
