import test from 'ava';
import reducer, {setWelcomeTeam, nextPage, previousPage} from '../welcomeDuck';

const stateTemplate = {
  page: 1,
  teamId: null,
  teamMemberId: null
};

test('initial state', t => {
  const initialState = reducer();
  t.deepEqual(initialState, stateTemplate);
});

test('setWelcomeTeam() updates teamId, teamMemberId', t => {
  const state = reducer();

  t.deepEqual(
    reducer(state,
      setWelcomeTeam({
        teamId: 'apple1',
        teamMemberId: 'banana2'
      })
    ), {
      ...stateTemplate,
      teamId: 'apple1',
      teamMemberId: 'banana2'
    }
  );
});

test('nextPage() increments', t => {
  const initialState = reducer();
  t.deepEqual(reducer(initialState, nextPage()), {
    ...stateTemplate,
    page: 2
  });
});

test('nextPage() does not exceed 3', t => {
  let state = reducer();
  for (let i = 0; i < 3; i++) {
    state = reducer(state, nextPage());
  }

  t.deepEqual(reducer(state, nextPage()), {
    ...stateTemplate,
    page: 3
  });
});

test('previousPage() decrements', t => {
  let state = reducer();
  state = reducer(state, nextPage());

  t.deepEqual(reducer(state, previousPage()), {
    ...stateTemplate,
    page: 1
  });
});

test('previousPage() is never less than one', t => {
  let state = reducer();
  state = reducer(state, previousPage());

  t.deepEqual(reducer(state, previousPage()), {
    ...stateTemplate,
    page: 1
  });
});
