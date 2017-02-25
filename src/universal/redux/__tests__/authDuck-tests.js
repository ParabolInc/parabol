import {applyMiddleware, combineReducers, createStore} from 'redux';
import thunk from 'redux-thunk';
import auth, {setAuthToken, removeAuthToken} from '../authDuck';
import {testToken, testTokenData, emptyToken} from './testTokens';

const appReducers = {auth};
let appReducer;
let store;
let initialState;

const initialStateAssertion = { auth: emptyToken };

beforeEach(() => {
  appReducer = combineReducers({...appReducers});
  store = createStore(appReducer, {}, applyMiddleware(thunk));
  initialState = store.getState();

  return initialState;
});


test('initial state', () => {
  expect(initialState).toEqual(initialStateAssertion);
});

test('can setAuthToken w/token decode', () => {
  const expectedState = {
    ...initialStateAssertion,
    auth: {
      obj: testTokenData,
      token: testToken,
      nextUrl: null
    }
  };
  store.dispatch(setAuthToken(testToken));
  const nextState = store.getState();
  expect(expectedState).toEqual(nextState);
});

test('throws when token undefined', () => {
  expect(() =>
    store.dispatch(setAuthToken(undefined))
  ).toThrow();
});

test('throws when token invalid', () => {
  expect(() =>
    store.dispatch(setAuthToken(42))
  ).toThrow();
});

test('can removeAuthToken', () => {
  store.dispatch(setAuthToken(testToken));
  store.dispatch(removeAuthToken());
  expect(initialState).toEqual(store.getState());
});
