import test from 'ava';
import reducer, {setAuthToken, removeAuthToken} from '../authDuck';
import {testToken, testTokenData} from './testTokens';

const stateTemplate = {
  token: null,
  obj: {
    aud: null,
    exp: null,
    iat: null,
    iss: null,
    sub: null,
    tms: []
  }
};

test('initial state', t => {
  const initialState = reducer();
  t.deepEqual(initialState, stateTemplate);
});

test('can setAuthToken w/token decode', t => {
  const initialState = reducer();
  const expectedState = {
    obj: testTokenData,
    token: testToken
  };
  t.deepEqual(
    expectedState,
    reducer(initialState, setAuthToken(testToken))
  );
});

test('throws when token undefined', t => {
  const initialState = reducer();
  t.throws(() =>
    reducer(initialState, setAuthToken(undefined))
  );
});

test('throws when token invalid', t => {
  const initialState = reducer();
  t.throws(() =>
    reducer(initialState, setAuthToken(42))
  );
});

test('can removeAuthToken', t => {
  const initialState = reducer();
  const nextState = reducer(initialState, setAuthToken(testToken));
  t.deepEqual(
    initialState,
    reducer(nextState, removeAuthToken())
  );
});
