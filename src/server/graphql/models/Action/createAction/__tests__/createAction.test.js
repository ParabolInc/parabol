import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import createAction from 'server/graphql/models/Action/createAction/createAction';
import shortid from 'shortid';

MockDate.set(__now);
console.error = jest.fn();

describe('createAction', () => {
  test('creates an action from a meeting', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {agendaItem, user, team, teamMember} = await mockDB.init()
      .newAgendaItem();

    // TEST
    const teamId = team[0].id;
    const teamMemberId = teamMember[7].id;
    const agendaId = agendaItem[0].id;
    const authToken = mockAuthToken(user[7]);
    const newAction = {
      id: `${teamId}::${shortid.generate()}`,
      teamMemberId,
      sortOrder: 0,
      agendaId
    };
    await createAction.resolve(undefined, {newAction}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      action: r.table('Action').get(newAction.id),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('creates an action from the team dash', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {user, team, teamMember} = await mockDB.init();

    // TEST
    const teamId = team[0].id;
    const teamMemberId = teamMember[7].id;
    const authToken = mockAuthToken(user[7]);
    const newAction = {
      id: `${teamId}::${shortid.generate()}`,
      teamMemberId,
      sortOrder: 0,
    };
    await createAction.resolve(undefined, {newAction}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      action: r.table('Action').get(newAction.id),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('throws when no websocket is present', async() => {
    const authToken = {};
    await expectAsyncToThrow(createAction.resolve(undefined, {newAction: {}}, {authToken}));
  });

  test('throw when the caller is not a team member', async() => {
    // SETUP
    const mockDB = new MockDB();
    const {teamMember, user} = await mockDB.init();

    // TEST
    const authToken = mockAuthToken(user[1]);
    const teamMemberId = teamMember[7].id;
    const newAction = {
      id: `foo::${shortid.generate()}`,
      teamMemberId,
      sortOrder: 0,
    };
    await expectAsyncToThrow(createAction.resolve(undefined, {newAction}, {authToken, socket}), [mockDB.context.team.id]);
  });
});
