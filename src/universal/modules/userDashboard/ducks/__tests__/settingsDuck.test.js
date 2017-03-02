import reducer, {
  ACTIVITY_WELCOME,
  setActivity,
  setWelcomeActivity,
  clearActivity
} from '../settingsDuck';

test('initial state', () => {
  const initialState = reducer();
  expect(initialState).toMatchSnapshot();
});

test('setActivity() ACTIVITY_WELCOME updates activity, nextPage', () => {
  expect(
    reducer(undefined,
      setActivity(ACTIVITY_WELCOME, '/team/baddad')
    )
  ).toMatchSnapshot();
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
  ).toMatchSnapshot();
});

test('clearWelcomeActivity() resets state', () => {
  const state = reducer();

  expect(
    reducer(state, clearActivity())
  ).toMatchSnapshot();
});
