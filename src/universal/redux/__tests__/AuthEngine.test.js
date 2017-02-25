import {applyMiddleware, createStore, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import auth, {DEFAULT_AUTH_REDUCER_NAME} from '../authDuck';
import ReduxAuthEngine from '../AuthEngine';
import {testToken} from './testTokens';

const REDUCER_NAME = 'marvin'; // use a different key than default for testing
const reducers = combineReducers({[REDUCER_NAME]: auth});
let store;
let rae;

beforeEach(() => {
  store = createStore(reducers, {}, applyMiddleware(thunk));
  rae = new ReduxAuthEngine(store, REDUCER_NAME);
});

test('use default reducer', () => {
  rae = new ReduxAuthEngine(store);
  expect(rae.reducerName).toBe(DEFAULT_AUTH_REDUCER_NAME);
});

test('constructor uses store', () => {
  expect(rae.store).toBe(store);
});

test('saveToken saves token', (done) => {
  const cb = (err, token) => {
    expect(err).toBe(null);
    expect(token).toBe(testToken);
    done();
  };

  rae.saveToken('aName', testToken, null, cb);
  expect(store.getState()).toMatchSnapshot();
});

test('removeToken removes token', (done) => {
  const cb = (err, token) => {
    expect(err).toBe(null);
    expect(token).toBe(testToken);
    done();
  };

  rae.saveToken('aName', testToken);
  rae.removeToken('aName', cb);
  expect(rae.store.getState()).toMatchSnapshot();
});

test('loadToken callsback with token', (done) => {
  const cb = (err, token) => {
    expect(err).toBe(null);
    expect(token).toBe(testToken);
    done();
  };

  rae.saveToken('aName', testToken);
  rae.loadToken('aName', cb);
});
