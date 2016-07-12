import test from 'ava';
import reducer, {
  ACTIVITY_WELCOME,
  setActivity,
  setWelcomeActivity,
  clearActivity
} from '../settingsDuck';

const stateTemplate = {
  activity: null,
  nextPage: null
};

test('initial state', t => {
  const initialState = reducer();
  t.deepEqual(initialState, stateTemplate);
});

test('setActivity() ACTIVITY_WELCOME updates activity, nextPage', t => {
  const state = reducer();

  t.deepEqual(
    reducer(state,
      setActivity(ACTIVITY_WELCOME, '/team/baddad')
    ),
    {
      ...stateTemplate,
      activity: ACTIVITY_WELCOME,
      nextPage: '/team/baddad'
    }
  );
});

test('setActivity() of invalid activity throws error', t => {
  t.throws(() => setActivity('narf!', '/team/d00d00'));
});

test('setWelcomeActivity() updates activity, nextPage', t => {
  const state = reducer();

  t.deepEqual(
    reducer(state,
      setWelcomeActivity('/team/baddad')
    ),
    {
      ...stateTemplate,
      activity: ACTIVITY_WELCOME,
      nextPage: '/team/baddad'
    }
  );
});

test('clearWelcomeActivity() resets state', t => {
  const state = reducer();

  t.deepEqual(
    reducer(state, clearActivity()),
    stateTemplate
  );
});
