import {combineReducers} from 'redux';
import {cashayReducer} from 'cashay';
import notifications from 'universal/modules/notifications/ducks/notifications';
import {reducer as formReducer} from 'redux-form';
import auth from './authDuck';
import {reducer as storageReducer} from 'redux-storage-whitelist-fn';
import storageMerger from 'universal/redux/storageMerger';
import makeRootReducer from 'universal/redux/rootDuck';

const appReducers = {
  auth,
  cashay: cashayReducer,
  form: formReducer,
  notifications
};


export default (newReducers) => {
  Object.assign(appReducers, newReducers);
  const appReducer = combineReducers({...appReducers});
  const rootReducer = makeRootReducer(appReducer);

  return storageReducer(rootReducer, storageMerger);
};
