import {compose} from 'redux';
import {combineReducers} from 'redux-immutablejs';
import auth from '../modules/auth/ducks/auth';
import meeting from '../modules/meeting/ducks/meeting';
import {routing} from './routing';

// TODO make auth and meeting async
const currentReducers = {
  auth,
  meeting,
  routing
};

export default (newReducers, reducerEnhancers) => {
  Object.assign(currentReducers, newReducers);
  const reducer = combineReducers({...currentReducers});
  if (reducerEnhancers) {
    return Array.isArray(reducerEnhancers) ? compose(...reducerEnhancers)(reducer) : reducerEnhancers(reducer);
  }
  return reducer;
};
