import reducer, {
  setWelcomeTeam,
  nextPage,
  previousPage,
  updateCompleted
} from '../welcomeDuck';

const stateTemplate = {
  completed: 0,
  page: 1,
  teamId: null,
  teamMemberId: null,
  existingInvites: []
};

test('initial state', () => {
  const initialState = reducer();
  expect(initialState).toEqual(stateTemplate);
});

test('setWelcomeTeam() updates teamId, teamMemberId', () => {
  const state = reducer();

  expect(
    reducer(state,
      setWelcomeTeam({
        teamId: 'apple1',
        teamMemberId: 'banana2'
      })
    )
  ).toEqual({
    ...stateTemplate,
    teamId: 'apple1',
    teamMemberId: 'banana2'
  });
});

test('nextPage() increments', () => {
  const initialState = reducer();
  expect(reducer(initialState, nextPage()))
    .toEqual({
      ...stateTemplate,
      page: 2
    });
});

test('nextPage() does not exceed 3', () => {
  let state = reducer();
  for (let i = 0; i < 3; i++) {
    state = reducer(state, nextPage());
  }

  expect(reducer(state, nextPage()))
    .toEqual({
      ...stateTemplate,
      page: 3
    });
});

test('previousPage() decrements', () => {
  let state = reducer();
  state = reducer(state, nextPage());

  expect(reducer(state, previousPage()))
    .toEqual({
      ...stateTemplate,
      page: 1
    });
});

test('previousPage() is never less than one', () => {
  let state = reducer();
  state = reducer(state, previousPage());

  expect(reducer(state, previousPage()))
    .toEqual({
      ...stateTemplate,
      page: 1
    });
});

test('updateCompleted() updates state', () => {
  const state = reducer();
  expect(reducer(state, updateCompleted(2)))
    .toEqual({
      ...stateTemplate,
      completed: 2
    });
});
