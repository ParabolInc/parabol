import test from 'ava';
import reducer, {setProfile, clearProfile} from '../profileDuck';

const stateTemplate = {
  avatar: null,
  createdAt: null,
  email: null,
  name: null
};

const testProfile = {
  avatar: 'foo.jpg',
  createdAt: 42,
  email: 'moe@stooges.org',
  name: 'Moe'
};

test('initial state', t => {
  const initialState = reducer();
  t.deepEqual(initialState, stateTemplate);
});

test('can set profile', t => {
  const initialState = reducer();

  t.deepEqual(
    testProfile,
    reducer(initialState, setProfile(testProfile))
  );
});

test('can clear profile', t => {
  const initialState = reducer();
  const nextState = reducer(initialState, setProfile(testProfile));
  t.deepEqual(
    initialState,
    reducer(nextState, clearProfile())
  );
});
