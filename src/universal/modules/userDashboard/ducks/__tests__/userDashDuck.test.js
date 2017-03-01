import reducer, {
  selectNewActionTeam,
  filterTeam,
} from '../userDashDuck';

test('initial state', () => {
  const initialState = reducer();
  expect(initialState).toMatchSnapshot();
});

test('selectNewActionTeam on', () => {
  expect(reducer(undefined, selectNewActionTeam(true))).toMatchSnapshot();
});

test('selectNewActionTeam off', () => {
  const state = reducer(undefined, selectNewActionTeam(true));
  const nextState = reducer(state, selectNewActionTeam(false));
  expect(nextState).toMatchSnapshot();
});

test('filter team on', () => {
  const state = reducer(undefined, filterTeam('123', 'Team A'));
  expect(state).toMatchSnapshot();
});

test('filter team off', () => {
  const state = reducer(undefined, filterTeam('123', 'Team A'));
  const nextState = reducer(state, filterTeam());
  expect(nextState).toMatchSnapshot();
});

test('filter team off bad input', () => {
  const state = reducer(undefined, filterTeam('123', 'Team A'));
  const nextState = reducer(state, filterTeam(null, 'Foo'));
  expect(nextState).toMatchSnapshot();
});
