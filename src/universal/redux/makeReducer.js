import {combineReducers} from 'redux';
import {cashayReducer} from 'cashay';
import notifications from 'universal/modules/notifications/ducks/notifications';
import {reducer as formReducer, actionTypes} from 'redux-form';
import auth from './authDuck';
import editing from './editingDuck';
import {reducer as storageReducer} from 'redux-storage-whitelist-fn';
import storageMerger from 'universal/redux/storageMerger';
import makeRootReducer from 'universal/redux/rootDuck';

const {SET_SUBMIT_SUCCEEDED} = actionTypes;

const formPlugin = {
  agendaInput: (state, action) => {
    //
    return (action.type === SET_SUBMIT_SUCCEEDED) ? undefined : state;
  }
};

const appReducers = {
  auth,
  cashay: cashayReducer,
  editing,
  form: formReducer.plugin(formPlugin),
  notifications
};


export default (newReducers) => {
  Object.assign(appReducers, newReducers);
  const appReducer = combineReducers({...appReducers});
  const rootReducer = makeRootReducer(appReducer);

  return storageReducer(rootReducer, storageMerger);
};
