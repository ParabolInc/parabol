import test from 'ava';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';
import makeRootReducer, {reset} from '../rootDuck';
import authReducer, {setAuthToken} from '../authDuck';
import profile from '../profileDuck';
import {testToken} from './testTokens';

test.beforeEach(t => {
  const appReducers = { auth: authReducer, profile };
  t.context.appReducer = combineReducers({...appReducers});
  t.context.rootReducer = makeRootReducer(t.context.appReducer);
  t.context.store = createStore(t.context.rootReducer, {}, applyMiddleware(thunk));
  t.context.initialState = t.context.store.getState();
});

test('initial state', t => {
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
    },
    profile: {
      avatar: null,
      createdAt: null,
      email: null,
      name: null
    }
  };
  t.deepEqual(t.context.initialState, stateTemplate);
});

test('reset app state', t => {
  t.plan(2);
  t.context.store.dispatch(setAuthToken(testToken));
  const nextState = t.context.store.getState();
  t.notDeepEqual(t.context.initialState, nextState);
  t.context.store.dispatch(reset());
  const resetState = t.context.store.getState();
  t.deepEqual(t.context.initialState, resetState);
});

test('reset app state with whitelist', t => {
  t.plan(2);
  t.context.store.dispatch(setAuthToken(testToken));
  const nextState = t.context.store.getState();
  t.notDeepEqual(t.context.initialState, nextState);
  t.context.store.dispatch(reset(['auth']));
  const resetState = t.context.store.getState();
  t.deepEqual(nextState, resetState);
});
