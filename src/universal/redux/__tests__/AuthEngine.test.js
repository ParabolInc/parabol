import {applyMiddleware, createStore, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import auth, {DEFAULT_AUTH_REDUCER_NAME} from '../authDuck';
import ReduxAuthEngine from '../AuthEngine';
import {testToken} from './testTokens';
import * as segmentActions from '../segmentActions';

const REDUCER_NAME = 'marvin'; // use a different key than default for testing
const reducers = combineReducers({[REDUCER_NAME]: auth});
let store;
let rae;
segmentActions.selectSegmentTraits = jest.fn(() => ({email: 'a@a.co'}));
segmentActions.segmentEventIdentify = jest.fn(() => ({ type: '@@segment/EVENT' }));
segmentActions.segmentEventReset = jest.fn(() => ({ type: '@@segment/EVENT' }));

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
    expect(segmentActions.segmentEventIdentify).toBeCalled();
    done();
  };

  rae.saveToken('aName', testToken, null, cb);
  expect(store.getState()).toMatchSnapshot();
});

test('removeToken removes token', (done) => {
  const cb = (err, token) => {
    expect(err).toBe(null);
    expect(token).toBe(testToken);
    expect(segmentActions.segmentEventReset).toBeCalled();
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
    expect(segmentActions.segmentEventIdentify).toBeCalled();
    done();
  };

  rae.saveToken('aName', testToken);
  rae.loadToken('aName', cb);
});
