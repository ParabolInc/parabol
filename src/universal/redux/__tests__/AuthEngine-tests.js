import test from 'ava';
import sinon from 'sinon';
import {applyMiddleware, createStore, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import auth from '../authDuck';
import ReduxAuthEngine from '../AuthEngine';
import {testToken, testTokenData} from './testTokens';

import {cashay} from 'cashay';

const REDUCER_NAME = 'marvin'; // use a different key than default for testing
const reducers = combineReducers({[REDUCER_NAME]: auth});
const store = createStore(reducers, {}, applyMiddleware(thunk));

test.before(() => {
  // stub cashay.query to return mocked data:
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
  sinon.stub(cashay, 'query').callsFake(cashayQueryUserStub);
});

test.after.always('cleanup', () => {
  cashay.query.restore();
});

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
        token: null,
        obj: {
          aud: null,
          exp: null,
          iat: null,
          iss: null,
          sub: null
        }
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
