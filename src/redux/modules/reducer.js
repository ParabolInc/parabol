import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';
import auth from './auth';
import meeting from './meeting';

export default combineReducers({
  auth: auth,
  router: routerStateReducer,
  meeting: meeting
});
