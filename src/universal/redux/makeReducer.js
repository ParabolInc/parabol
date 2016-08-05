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
  /**
   * Add the initial state of the new reducers to the initialReducers object. If
   * we later revert the application to the initial state -- say to logout --
   * we'll need these dynamically loaded initial states present so
   * mapStateToProps can run one last time before the component unmounts:
   */
  Object.assign(initialReducers, newReducers);
  // Add the new reducers to the current reducers:
  Object.assign(currentReducers, newReducers);
  const reducer = combineReducers({...currentReducers});
  return storageReducer(reducer, storageMerger);
};

export const makeWhitelistedReducer = (whitelist) => {
  /**
   * Create a new reducer starting from the initial application state,
   * which may include the initial states of any reducers which have been
   * dynamically loaded:
   */
  let reducer = Object.assign({}, initialReducers);
  whitelist.forEach((keeper) => {
    if (keeper in currentReducers) {
      // Preserve the current state of any whitelisted reducers:
      reducer[keeper] = currentReducers[keeper];
    }
  });
  reducer = combineReducers({...reducer});
  return storageReducer(reducer, storageMerger);
};
