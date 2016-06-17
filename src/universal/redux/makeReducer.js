import {compose, combineReducers} from 'redux';
import {cashayReducer} from 'cashay';
// import meetingModule from '../modules/meeting/ducks/index';
import notifications from '../modules/notifications/ducks/notifications';
import {routing} from './routing';

// TODO make auth and meeting async
const currentReducers = {
  cashay: cashayReducer,
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
