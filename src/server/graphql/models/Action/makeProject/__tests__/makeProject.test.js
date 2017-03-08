import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import makeProject from 'server/graphql/models/Action/makeProject/makeProject';

MockDate.set(__now);
console.error = jest.fn();


describe('makeProject', () => {
  test('convert an action into a project', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {action, user} = await mockDB.init()
      .newAction();

    // TEST
    const actionId = action[0].id;
    const authToken = mockAuthToken(user[7]);
    await makeProject.resolve(undefined, {actionId}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      action: r.table('Action').get(actionId).default({}),
      project: r.table('Project').get(actionId)
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });

  test('throws when no websocket is present', async() => {
    const authToken = {};
    await expectAsyncToThrow(makeProject.resolve(undefined, {actionId: {}}, {authToken}));
  });

  test('throw when the caller is not a team member', async() => {
    // SETUP
    const mockDB = new MockDB();
    const {action, user} = await mockDB.init()
      .newAction();

    // TEST
    const authToken = mockAuthToken(user[1], {tms: ['foo']});
    const actionId = action[0].id;

    // VERIFY
    await expectAsyncToThrow(makeProject.resolve(undefined, {actionId}, {authToken, socket}), [mockDB.context.team.id]);
  });
});
