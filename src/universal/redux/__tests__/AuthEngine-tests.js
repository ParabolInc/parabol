import {applyMiddleware, createStore, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import auth from '../authDuck';
import ReduxAuthEngine from '../AuthEngine';
import {testToken, testTokenData} from './testTokens';

import {cashay} from 'cashay';

const REDUCER_NAME = 'marvin'; // use a different key than default for testing
const reducers = combineReducers({[REDUCER_NAME]: auth});
const store = createStore(reducers, {}, applyMiddleware(thunk));

const cashayQueryUserStub = () => {
  return ({
    data: {
      user: {
        avatar: null,
        email: null,
        id: null,
        name: null
      }
    }
  });
};
cashay.query = jest.fn(cashayQueryUserStub);

test('constructor stores store', () => {
  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  expect(rae.store).toEqual(store);
});

test('saveToken saves token', (done) => {
  const cb = (unused, token) => {
    expect(unused).toBe(null);
    expect(token).toBe(testToken);
    done();
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', testToken, null, cb);
  expect(rae.store.getState())
    .toEqual({
      [REDUCER_NAME]: {
        obj: testTokenData,
        token: testToken
      }
    });
});

test('removeToken removes token', (done) => {
  const cb = (unused, token) => {
    expect(unused).toBe(null);
    expect(token).toBe(testToken);
    done();
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', testToken);
  rae.removeToken('aName', cb);
  expect(rae.store.getState())
    .toEqual({
      [REDUCER_NAME]: {
        token: null,
        obj: {
          aud: null,
          exp: null,
          iat: null,
          iss: null,
          sub: null
        }
      }
    });
});

test('loadToken callsback with token', (done) => {
  const cb = (unused, token) => {
    expect(unused).toBe(null);
    expect(token).toBe(testToken);
    done();
  };

  const rae = new ReduxAuthEngine(store, REDUCER_NAME);
  rae.saveToken('aName', testToken);
  rae.loadToken('aName', cb);
});
