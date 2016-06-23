import {compose, combineReducers} from 'redux';
import {cashayReducer} from 'cashay';
import notifications from '../modules/notifications/ducks/notifications';
import {reducer as formReducer} from 'redux-form';
import {routing} from './routing';

const currentReducers = {
  cashay: cashayReducer,
  form: formReducer,
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
