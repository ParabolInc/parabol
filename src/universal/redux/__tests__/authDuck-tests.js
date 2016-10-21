import test from 'ava';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';
import auth, {setAuthToken, removeAuthToken} from '../authDuck';
import profile from '../profileDuck';
import {testToken, testTokenData} from './testTokens';

test.beforeEach(t => {
  const appReducers = { auth, profile };
  t.context.appReducer = combineReducers({...appReducers});
  t.context.store = createStore(t.context.appReducer, {}, applyMiddleware(thunk));
  t.context.initialState = t.context.store.getState();
});

const initialStateAssertion = {
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

test('initial state', t => {
  t.deepEqual(t.context.initialState, initialStateAssertion);
});

test('can setAuthToken w/token decode', t => {
  const expectedState = {
    ...initialStateAssertion,
    auth: {
      obj: testTokenData,
      token: testToken,
    }
  };
  t.context.store.dispatch(setAuthToken(testToken));
  const nextState = t.context.store.getState();
  t.deepEqual(expectedState, nextState);
});

test('throws when token undefined', t => {
  t.throws(() =>
    t.context.store.dispatch(setAuthToken(undefined))
  );
});

test('throws when token invalid', t => {
  t.throws(() =>
    t.context.store.dispatch(setAuthToken(42))
  );
});

test('can removeAuthToken', t => {
  t.context.store.dispatch(setAuthToken(testToken));
  t.context.store.dispatch(removeAuthToken());
  t.deepEqual(
    t.context.initialState,
    t.context.store.getState()
  );
});

// TODO: add profile test
test('does set profile as thunk side-effect', t => {
  const newProfile = {
    avatar: 'moe.jpg',
    createdAt: new Date(),
    email: 'moe@stooges.org',
    name: 'Moe'
  };
  const expectedState = {
    auth: {
      obj: testTokenData,
      token: testToken,
    },
    profile: { ...newProfile }
  };
  t.context.store.dispatch(setAuthToken(testToken, newProfile));
  t.deepEqual(
    expectedState,
    t.context.store.getState()
  );
});
