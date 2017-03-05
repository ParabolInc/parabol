import reducer, {
  goToPage,
  setWelcomeTeam,
  nextPage,
  previousPage,
  updateCompleted
} from '../welcomeDuck';

test('initial state', () => {
  expect(reducer()).toMatchSnapshot();
});

test('setWelcomeTeam() updates teamId, teamMemberId', () => {
  expect(
    reducer(undefined,
      setWelcomeTeam({
        teamId: 'apple1',
        teamMemberId: 'banana2'
      })
    )
  ).toMatchSnapshot();
});

test('nextPage() increments', () => {
  const initialState = reducer();
  expect(reducer(initialState, nextPage()))
    .toMatchSnapshot();
});

test('nextPage() does not exceed 3', () => {
  let state = reducer();
  for (let i = 0; i < 4; i++) {
    state = reducer(state, nextPage());
  }

  expect(reducer(state, nextPage())).toMatchSnapshot();
});

test('previousPage() decrements', () => {
  let state = reducer();
  state = reducer(state, nextPage());

  expect(reducer(state, previousPage())).toMatchSnapshot();
});

test('previousPage() is never less than one', () => {
  let state = reducer();
  state = reducer(state, previousPage());
  expect(reducer(state, previousPage())).toMatchSnapshot();
});

test('updateCompleted() updates state', () => {
  const state = reducer();
  expect(reducer(state, updateCompleted(2))).toMatchSnapshot();
});

test('goToPage', () => {
  expect(reducer(undefined, goToPage(1))).toMatchSnapshot();
});
