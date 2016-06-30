import test from 'ava';
import reducer, {setWelcomeTeam, nextPage, previousPage} from '../welcomeDuck';

test('initial state', t => {
  const initialState = reducer();
  t.deepEqual(initialState,
    {page: 1, teamId: null, teamMemberId: null}
  );
});

test('setWelcomeTeam() updates teamId, teamMemberId', t => {
  const state = reducer();

  t.deepEqual(
    reducer(state,
      setWelcomeTeam({
        teamId: 'apple1',
        teamMemberId: 'banana2'
      })
    ),
    {page: 1, teamId: 'apple1', teamMemberId: 'banana2'}
  );
});

test('nextPage() increments', t => {
  const initialState = reducer();
  t.deepEqual(reducer(initialState, nextPage()),
    {page: 2, teamId: null, teamMemberId: null}
  );
});

test('nextPage() does not exceed 3', t => {
  let state = reducer();
  for (let i = 0; i < 3; i++) {
    state = reducer(state, nextPage());
  }

  t.deepEqual(reducer(state, nextPage()),
    {page: 3, teamId: null, teamMemberId: null}
  );
});

test('previousPage() decrements', t => {
  let state = reducer();
  state = reducer(state, nextPage());

  t.deepEqual(reducer(state, previousPage()),
    {page: 1, teamId: null, teamMemberId: null}
  );
});

test('previousPage() is never less than one', t => {
  let state = reducer();
  state = reducer(state, previousPage());

  t.deepEqual(reducer(state, previousPage()),
    {page: 1, teamId: null, teamMemberId: null}
  );
});
