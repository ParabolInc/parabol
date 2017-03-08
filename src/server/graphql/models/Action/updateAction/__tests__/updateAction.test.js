import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import updateAction from 'server/graphql/models/Action/updateAction/updateAction';

MockDate.set(__now);
console.error = jest.fn();

describe('updateAction', () => {
  test('updates the sortOrder without changing updatedAt', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {action, user} = await mockDB.init()
      .newAction();
    const actionId = action[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedAction = {
      id: actionId,
      sortOrder: 2
    };
    await updateAction.resolve(undefined, {updatedAction}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      action: r.table('Action').get(actionId),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('updates the content of the action', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {action, user} = await mockDB.init()
      .newAction();
    const actionId = action[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedAction = {
      id: actionId,
      content: 'Updated content'
    };
    await updateAction.resolve(undefined, {updatedAction}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      action: r.table('Action').get(actionId),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('updates the status of the action', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {action, user} = await mockDB.init()
      .newAction();
    const actionId = action[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedAction = {
      id: actionId,
      isComplete: true
    };
    await updateAction.resolve(undefined, {updatedAction}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      action: r.table('Action').get(actionId),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('updates the teamMemberId of the action (in meeting only)', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {action, teamMember, user} = await mockDB.init()
      .newAction();
    const actionId = action[0].id;
    const authToken = mockAuthToken(user[7]);

    // TEST
    const updatedAction = {
      id: actionId,
      teamMemberId: teamMember[5].id
    };
    await updateAction.resolve(undefined, {updatedAction}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      action: r.table('Action').get(actionId),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('throws when no websocket is present', async() => {
    const authToken = {};
    await expectAsyncToThrow(updateAction.resolve(undefined, {updatedAction: {}}, {authToken}));
  });

  test('throw when the caller is not a team member', async() => {
    // SETUP
    const mockDB = new MockDB();
    const {action, user} = await mockDB.init()
      .newAction();
    const authToken = mockAuthToken(user[1], {tms: ['foo']});
    const actionId = action[0].id;

    // TEST
    const updatedAction = {
      id: actionId,
      isComplete: true
    };
    await expectAsyncToThrow(updateAction.resolve(undefined, {updatedAction}, {authToken, socket}), [mockDB.context.team.id]);
  });
});
