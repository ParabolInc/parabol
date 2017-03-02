import getRethink from 'server/database/rethinkDriver';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndTrim from 'server/__tests__/utils/fetchAndTrim';
import TrimSnapshot from 'server/__tests__/utils/TrimSnapshot';
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
    const trimSnapshot = new TrimSnapshot();
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
    const db = await fetchAndTrim({
      action: r.table('Action').get(actionId),
    }, trimSnapshot);
    expect(db).toMatchSnapshot();
  });

  test('throws when no websocket is present', async() => {
    const authToken = {};
    await expectAsyncToThrow(updateAction.resolve(undefined, {updatedAction: {}}, {authToken}));
  });
});
