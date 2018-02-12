import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import MockPubSub from 'server/__mocks__/MockPubSub';
import makeDataLoader from 'server/__tests__/setup/makeDataLoader';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import getRethink from 'server/database/rethinkDriver';
import removeTeamMember from 'server/graphql/mutations/removeTeamMember';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';

MockDate.set(__now);
console.error = jest.fn();

describe('removeTeamMember', () => {
  test('promotes another member if the person removed was the lead', async () => {

  });

  test('removes the teamMember, reassigns active tasks to the lead', async () => {
    // SETUP
    const r = getRethink();
    const mockPubSub = new MockPubSub();
    const mockDB = new MockDB();
    const dynamicSerializer = new DynamicSerializer();
    await mockDB
      .init()
      .newTask();
    auth0ManagementClient.__initMock(mockDB.db);
    auth0ManagementClient.users.updateAppMetadata.mockReset();
    const userToBoot = mockDB.db.user[7];
    const authToken = mockAuthToken(mockDB.db.user[0]);
    const dataLoader = makeDataLoader(authToken);
    const teamId = mockDB.db.team[0].id;
    // TEST
    const teamMemberId = mockDB.db.teamMember[7].id;
    await removeTeamMember.resolve(undefined, {teamMemberId}, {authToken, dataLoader});

    const db = await fetchAndSerialize({
      teamMember: r.table('TeamMember').getAll(teamId, {index: 'teamId'}).orderBy('checkInOrder'),
      task: r.table('Task').getAll(teamId, {index: 'teamId'}),
      user: r.table('User').get(userToBoot.id)
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(auth0ManagementClient.users.updateAppMetadata.mock.calls.length)
      .toBe(1);
    expect(mockPubSub.__serialize(dynamicSerializer)).toMatchSnapshot();
  });

  test('throw if the caller is not self or team lead', async () => {
    // reassigns their tasks

    // deactivates providers

    // updates tms in auth0

    // inserts notification in table if kickout

    // sends notification via pubsub

    // remove github repos

    // archive githug tasks attached to those repos
    // SETUP
    const mockDB = new MockDB();
    await mockDB
      .init()
      .newTask();
    auth0ManagementClient.__initMock(mockDB.db);
    auth0ManagementClient.users.updateAppMetadata.mockReset();
    const authToken = mockAuthToken(mockDB.db.user[1]);
    const dataLoader = makeDataLoader(authToken);
    // TEST
    const teamMemberId = mockDB.db.teamMember[7].id;
    await expectAsyncToThrow(
      removeTeamMember.resolve(
        undefined,
        {teamMemberId},
        {authToken, dataLoader}
      )
    );
  });
});
