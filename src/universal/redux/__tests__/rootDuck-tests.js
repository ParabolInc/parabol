import test from 'ava';
import {combineReducers} from 'redux';
import makeRootReducer, {reset} from '../rootDuck';
import authReducer, {setAuthToken} from '../authDuck';

test.beforeEach(t => {
  const appReducers = { authToken: authReducer };
  t.context.appReducer = combineReducers({...appReducers});
  t.context.rootReducer = makeRootReducer(t.context.appReducer);
  t.context.initialState = t.context.rootReducer();
});

test('initial state', t => {
  const stateTemplate = { authToken: null };
  t.deepEqual(t.context.initialState, stateTemplate);
});

test('reset app state', t => {
  t.plan(2);
  const nextState = t.context.rootReducer(
    t.context.initialState,
    setAuthToken(42)
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
    setAuthToken(42)
  );
  t.notDeepEqual(t.context.initialState, nextState);
  t.deepEqual(
    nextState,
    t.context.rootReducer(nextState, reset(['authToken']))
  );
});
