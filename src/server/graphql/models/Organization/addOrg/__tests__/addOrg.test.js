import getRethink from 'server/database/rethinkDriver';
import addOrg from 'server/graphql/models/Organization/addOrg/addOrg';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import stripe from 'server/billing/stripe';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import socket from 'server/__mocks__/socket';
import shortid from 'shortid';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';

MockDate.set(__now);
console.error = jest.fn();

describe('addOrg', () => {
  test('adds a new org with no invitees', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const stripeToken = 'tok_4242424242424242';
    const {organization, user} = await mockDB.init()
      .org(0, {creditCard: creditCardByToken[stripeToken]});
    const org = organization[0];
    stripe.__setMockData(org);
    auth0ManagementClient.__initMock(mockDB.db);
    const authToken = mockAuthToken(user[0]);

    // TEST
    const newTeam = {
      id: shortid.generate(),
      name: 'addOrg|1|NewTeamName',
      orgId: shortid.generate()
    };
    const orgName = 'addOrg|1|NewOrgName';
    await addOrg.resolve(undefined, {newTeam, orgName, stripeToken}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').getAll(newTeam.orgId, {index: 'id'}).orderBy('name'),
      team: r.table('Team').getAll(newTeam.orgId, {index: 'orgId'}).orderBy('name'),
      teamMember: r.table('TeamMember').getAll(newTeam.id, {index: 'teamId'}).orderBy('preferredName'),
      user: r.table('User').getAll(org.id, newTeam.orgId, {index: 'userOrgs'}).orderBy('preferredName')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });
});
