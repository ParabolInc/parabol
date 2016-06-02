import {combineReducers} from 'redux-immutablejs';
import meeting from './meeting';
import setup from './setup';
import shortcuts from './shortcuts';
import team from './team';

export default combineReducers({
  meeting,
  setup,
  shortcuts,
  team
});
