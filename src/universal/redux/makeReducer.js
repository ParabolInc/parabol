import {combineReducers} from 'redux';
import {cashayReducer} from 'cashay';
import notifications from 'universal/modules/notifications/ducks/notifications';
import {reducer as formReducer, actionTypes} from 'redux-form';
import auth from './authDuck';
import profile from './profileDuck';
import {reducer as storageReducer} from 'redux-storage-whitelist-fn';
import storageMerger from 'universal/redux/storageMerger';
import makeRootReducer from 'universal/redux/rootDuck';
import menuReducer from 'universal/modules/menu/ducks/menuDuck';
import outcomeCardReducer from 'universal/modules/outcomeCard/ducks/outcomeCardDuck';

const {SET_SUBMIT_SUCCEEDED} = actionTypes;

const formPlugin = {
  agendaInput: (state, action) => {
    // wipe the value clean when submitted
    return (action.type === SET_SUBMIT_SUCCEEDED) ? undefined : state;
  }
};

const appReducers = {
  auth,
  cashay: cashayReducer,
  form: formReducer.plugin(formPlugin),
  menu: menuReducer,
  notifications,
  outcomeCard: outcomeCardReducer,
  profile
};


export default (newReducers) => {
  Object.assign(appReducers, newReducers);
  const appReducer = combineReducers({...appReducers});
  const rootReducer = makeRootReducer(appReducer);

  return storageReducer(rootReducer, storageMerger);
};
