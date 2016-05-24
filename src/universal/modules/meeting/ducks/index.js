import {combineReducers} from 'redux-immutablejs';
import meeting from './meeting';
import setup from './setup';
import shortcuts from './shortcuts';

export default combineReducers({
  meeting,
  setup,
  shortcuts
});
