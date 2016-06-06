import {compose} from 'redux';
import {combineReducers} from 'redux-immutablejs';
import {cashayReducer} from 'cashay';
import auth from '../modules/auth/ducks/auth';
import meetingModule from '../modules/meeting/ducks/index';
import notifications from '../modules/notifications/ducks/notifications';
import {routing} from './routing';

// TODO make auth and meeting async
const currentReducers = {
  auth,
  cashay: cashayReducer,
  meetingModule,
  notifications,
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
