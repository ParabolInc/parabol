import {compose} from 'redux';
import {combineReducers} from 'redux-immutablejs';
import {cashayReducer} from 'cashay';
import auth from '../modules/auth/ducks/auth';
import meetingModule from '../modules/meeting/ducks/index';
import {routing} from './routing';

// TODO make auth and meeting async
const currentReducers = {
  auth,
  cashay: cashayReducer,
  meetingModule,
  routing
};

export default (newReducers, reducerEnhancers) => {
  Object.assign(currentReducers, newReducers);
  const reducer = combineReducers({...currentReducers});
  if (reducerEnhancers) {
    return Array.isArray(reducerEnhancers) ?
      compose(...reducerEnhancers)(reducer) : reducerEnhancers(reducer);
  }
  return reducer;
};
