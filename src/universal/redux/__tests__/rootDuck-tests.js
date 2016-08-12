import test from 'ava';
import {combineReducers} from 'redux';
import makeRootReducer, {reset} from '../rootDuck';
import authReducer, {setAuthToken} from '../authDuck';
import {testToken} from './testTokens';

test.beforeEach(t => {
  const appReducers = { auth: authReducer };
  t.context.appReducer = combineReducers({...appReducers});
  t.context.rootReducer = makeRootReducer(t.context.appReducer);
  t.context.initialState = t.context.rootReducer();
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
        sub: null,
        tms: []
      }
    }
  };
  t.deepEqual(t.context.initialState, stateTemplate);
});

test('reset app state', t => {
  t.plan(2);
  const nextState = t.context.rootReducer(
    t.context.initialState,
    setAuthToken(testToken)
  );
  t.notDeepEqual(t.context.initialState, nextState);
  t.deepEqual(
    t.context.initialState,
    t.context.rootReducer(nextState, reset())
  );
});

test('reset app state with whitelist', t => {
  t.plan(2);
  const nextState = t.context.rootReducer(
    t.context.initialState,
    setAuthToken(testToken)
  );
  t.notDeepEqual(t.context.initialState, nextState);
  t.deepEqual(
    nextState,
    t.context.rootReducer(nextState, reset(['auth']))
  );
});
