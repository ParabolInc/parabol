import {combineReducers} from 'redux-immutablejs';
import meeting from './meeting';
import shortcuts from './shortcuts';

export default combineReducers({
  meeting,
  shortcuts
});
