import test from 'ava';
import {createStore, combineReducers} from 'redux';
import auth from '../authDuck';
import ReduxAuthEngine from '../AuthEngine';
import {testToken, testTokenData} from './testTokens';

const REDUCER_NAME = 'marvin'; // use a different key than default for testing
const reducers = combineReducers({[REDUCER_NAME]: auth});
const store = createStore(reducers, {});

test('constructor stores store', t => {
  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  t.deepEqual(rae.store, store);
});

test('saveToken saves token', t => {
  t.plan(3);

  const cb = (unused, token) => {
    t.is(unused, null);
    t.is(token, testToken);
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', testToken, null, cb);
  t.deepEqual(
    rae.store.getState(),
    {
      [REDUCER_NAME]: {
        obj: testTokenData,
        token: testToken
      }
    }
  );
});

test('removeToken removes token', t => {
  t.plan(3);

  const cb = (unused, token) => {
    t.is(unused, null);
    t.is(token, testToken);
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', testToken);
  rae.removeToken('aName', cb);
  t.deepEqual(
    rae.store.getState(),
    {
      [REDUCER_NAME]: {
        obj: null,
        token: null
      }
    }
  );
});

test('loadToken callsback with token', t => {
  t.plan(2);

  const cb = (unused, token) => {
    t.is(unused, null);
    t.is(token, testToken);
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', testToken);
  rae.loadToken('aName', cb);
});
