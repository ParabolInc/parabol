import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import deleteAction from 'server/graphql/models/Action/deleteAction/deleteAction';

MockDate.set(__now);
console.error = jest.fn();

describe('deleteAction', () => {
  test('deletes an action', async () => {
    // SETUP
    const r = getRethink();
    const mockDB = new MockDB();
    const {action, user} = await mockDB.init()
      .newAction();

    // TEST
    const actionId = action[0].id;
    const authToken = mockAuthToken(user[7]);
    await deleteAction.resolve(undefined, {actionId}, {authToken, socket});

    // VERIFY
    const dbAction = await r.table('Action').get(actionId);
    expect(dbAction).toBe(null);
  });

  test('throws when no websocket is present', async () => {
    const authToken = {};
    await expectAsyncToThrow(deleteAction.resolve(undefined, {actionId: ''}, {authToken}));
  });

  test('throw when the caller is not a team member', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user} = await mockDB.init();

    // TEST
    const authToken = mockAuthToken(user[1]);
    const actionId = 'foo::bar';
    await expectAsyncToThrow(deleteAction.resolve(undefined, {actionId}, {authToken, socket}), [mockDB.context.team.id]);
  });
});
