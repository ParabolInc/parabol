import test from 'ava';
import reducer, {setAuthToken, removeAuthToken} from '../authDuck';

const stateTemplate = null;

test('initial state', t => {
  const initialState = reducer();
  t.deepEqual(initialState, stateTemplate);
});

test('can setAuthToken', t => {
  const state = reducer();
  t.deepEqual(reducer(state, setAuthToken(42)), 42);
});

test('can removeAuthToken', t => {
  const state = reducer();
  t.deepEqual(reducer(state, removeAuthToken(42)), null);
});
