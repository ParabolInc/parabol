import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';
import makeRootReducer, {reset} from '../rootDuck';
import authReducer, {setAuthToken} from '../authDuck';
import {testToken} from './testTokens';

let appReducer;
let rootReducer;
let store;
let initialState;

beforeEach(() => {
  const appReducers = {auth: authReducer};
  appReducer = combineReducers({...appReducers});
  rootReducer = makeRootReducer(appReducer);
  store = createStore(rootReducer, {}, applyMiddleware(thunk));
  initialState = store.getState();
});

test('initial state', () => {
  const stateTemplate = {
    auth: {
      token: null,
      obj: {
        aud: null,
        exp: null,
        iat: null,
        iss: null,
        sub: null
      }
    }
  };
  expect(initialState).toEqual(stateTemplate);
});

test('reset app state', () => {
  store.dispatch(setAuthToken(testToken));
  const nextState = store.getState();
  expect(initialState).not.toEqual(nextState);
  store.dispatch(reset());
  const resetState = store.getState();
  expect(initialState).toEqual(resetState);
});

test('reset app state with whitelist', () => {
  store.dispatch(setAuthToken(testToken));
  const nextState = store.getState();
  expect(initialState).not.toEqual(nextState);
  store.dispatch(reset(['auth']));
  const resetState = store.getState();
  expect(nextState).toEqual(resetState);
});
