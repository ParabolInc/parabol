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

test('initial state', () => {
  const initialState = reducer();
  expect(initialState).toEqual(stateTemplate);
});

test('setActivity() ACTIVITY_WELCOME updates activity, nextPage', () => {
  const state = reducer();

  expect(
    reducer(state,
      setActivity(ACTIVITY_WELCOME, '/team/baddad')
    )
  ).toEqual(
    {
      ...stateTemplate,
      activity: ACTIVITY_WELCOME,
      nextPage: '/team/baddad'
    }
  );
});

test('setActivity() of invalid activity throws error', () => {
  expect(() => setActivity('narf!', '/team/d00d00')).toThrow();
});

test('setWelcomeActivity() updates activity, nextPage', () => {
  const state = reducer();

  expect(
    reducer(state,
      setWelcomeActivity('/team/baddad')
    )
  ).toEqual(
    {
      ...stateTemplate,
      activity: ACTIVITY_WELCOME,
      nextPage: '/team/baddad'
    }
  );
});

test('clearWelcomeActivity() resets state', () => {
  const state = reducer();

  expect(
    reducer(state, clearActivity())
  ).toEqual(stateTemplate);
});
