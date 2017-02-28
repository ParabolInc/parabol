import {createStore} from 'redux';
import makeRootReducer, {reset} from '../rootDuck';

let initialState;
let store;

beforeEach(() => {
  initialState = {foo: 1, bar: 2};
  store = createStore(makeRootReducer((state) => state), initialState);
});

test('store holds a non-empty state', () => {
  expect(store.getState()).toEqual(initialState);
});

test('reset app state', () => {
  store.dispatch(reset());
  expect(store.getState()).toEqual({});
});

test('reset app state with whitelist', () => {
  store.dispatch(reset(['foo']));
  expect(store.getState()).toEqual({foo: 1});
});
