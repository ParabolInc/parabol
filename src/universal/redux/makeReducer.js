import {combineReducers} from 'redux';
import {cashayReducer} from 'cashay';
import notifications from 'universal/modules/notifications/ducks/notifications';
import {reducer as formReducer} from 'redux-form';
import {routing} from './routing';
import authToken from './authDuck';
import {reducer as storageReducer} from 'redux-storage';
import storageMerger from 'universal/redux/storageMerger';

const currentReducers = {
  authToken,
  cashay: cashayReducer,
  form: formReducer,
  notifications,
  routing
};

export default (newReducers) => {
  Object.assign(currentReducers, newReducers);
  const reducer = combineReducers({...currentReducers});
  return storageReducer(reducer, storageMerger);
};
