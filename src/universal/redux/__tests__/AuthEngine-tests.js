import test from 'ava';
import {createStore, combineReducers} from 'redux';
import authToken from '../authDuck';
import ReduxAuthEngine from '../AuthEngine';

const REDUCER_NAME = 'marvin'; // use a different key than default for testing
const reducers = combineReducers({[REDUCER_NAME]: authToken});
const store = createStore(reducers, {});

test('constructor stores store', t => {
  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  t.deepEqual(rae.store, store);
});

test('saveToken saves token', t => {
  t.plan(3);

  const cb = (unused, token) => {
    t.is(unused, null);
    t.is(token, 42);
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', 42, null, cb);
  t.deepEqual(rae.store.getState(), {[REDUCER_NAME]: 42});
});

test('removeToken removes token', t => {
  t.plan(3);

  const cb = (unused, token) => {
    t.is(unused, null);
    t.is(token, 43);
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', 43);
  rae.removeToken('aName', cb);
  t.deepEqual(rae.store.getState(), {[REDUCER_NAME]: null});
});

test('loadToken callsback with token', t => {
  t.plan(2);

  const cb = (unused, token) => {
    t.is(unused, null);
    t.is(token, 5649);
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', 5649);
  rae.loadToken('aName', cb);
});
