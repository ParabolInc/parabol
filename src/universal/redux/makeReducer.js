import {combineReducers} from 'redux';
import {cashayReducer} from 'cashay';
import notifications from 'universal/modules/notifications/ducks/notifications';
import {reducer as formReducer} from 'redux-form';
import authToken from './authDuck';
import {reducer as storageReducer} from 'redux-storage-whitelist-fn';
import storageMerger from 'universal/redux/storageMerger';

const initialReducers = {
  authToken,
  cashay: cashayReducer,
  form: formReducer,
  notifications
};
const currentReducers = {...initialReducers};

export default (newReducers) => {
  Object.assign(initialReducers, newReducers);
  Object.assign(currentReducers, newReducers);
  const reducer = combineReducers({...currentReducers});
  return storageReducer(reducer, storageMerger);
};

export const makeWhitelistedReducer = (whitelist) => {
  let reducer = Object.assign({}, initialReducers);
  whitelist.forEach((keeper) => {
    if (keeper in currentReducers) {
      reducer[keeper] = currentReducers[keeper];
    }
  });
  reducer = combineReducers({...reducer});
  return storageReducer(reducer, storageMerger);
};
