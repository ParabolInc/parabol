import DynamicSerializer from 'dynamic-serializer';
import MockDate from 'mockdate';
import socket from 'server/__mocks__/socket';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import MockDB from 'server/__tests__/setup/MockDB';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import getRethink from 'server/database/rethinkDriver';
import addOrg from 'server/graphql/mutations/addOrg';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';
import shortid from 'shortid';

MockDate.set(__now);
console.error = jest.fn();

describe('addOrg', () => {
  test('adds a new org with no invitees', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {organization, user} = await mockDB.init()
      .organization(0);
    const org = organization[0];
    auth0ManagementClient.__initMock(mockDB.db);
    const authToken = mockAuthToken(user[0]);

    // TEST
    const newTeam = {
      id: shortid.generate(),
      name: 'addOrg|1|NewTeamName',
      orgId: shortid.generate()
    };
    const orgName = 'addOrg|1|NewOrgName';
    await addOrg.resolve(undefined, {newTeam, orgName}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').getAll(newTeam.orgId, {index: 'id'}).orderBy('name'),
      team: r.table('Team').getAll(newTeam.orgId, {index: 'orgId'}).orderBy('name'),
      teamMember: r.table('TeamMember').getAll(newTeam.id, {index: 'teamId'}).orderBy('preferredName'),
      user: r.table('User').getAll(org.id, newTeam.orgId, {index: 'userOrgs'}).orderBy('preferredName')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
  });
});
