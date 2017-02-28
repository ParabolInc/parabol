import getRethink from 'server/database/rethinkDriver';
import addOrg from 'server/graphql/models/Organization/addOrg/addOrg';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import stripe from 'server/billing/stripe';
import MockDate from 'mockdate';
import mockNow from 'server/__tests__/setup/mockNow';
import fetchAndTrim from 'server/__tests__/utils/fetchAndTrim';
import TrimSnapshot from 'server/__tests__/utils/TrimSnapshot';
import MockDB from 'server/__tests__/setup/MockDB';
import {PAYMENT_REJECTED, TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import socket from 'server/__mocks__/socket';
import shortid from 'shortid';
import {auth0ManagementClient} from 'server/utils/auth0Helpers';

MockDate.set(mockNow);
console.error = jest.fn();
const now = new Date();

describe('addOrg', () => {
  test.only('adds a new org with no invitees', async() => {
    // SETUP
    const r = getRethink();
    const trimSnapshot = new TrimSnapshot();
    const mockDB = new MockDB();
    const stripeToken = 'tok_4242424242424242';
    const {organization, user} = await mockDB.init()
      .org(0, {creditCard: creditCardByToken[stripeToken]});
    const org = organization[0];
    stripe.__setMockData(org, trimSnapshot);
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
    const db = await fetchAndTrim({
      organization: r.table('Organization').getAll(newTeam.orgId, {index: 'id'}).orderBy('name'),
      team: r.table('Team').getAll(newTeam.orgId, {index: 'orgId'}).orderBy('name'),
      teamMember: r.table('TeamMember').getAll(newTeam.id, {index: 'teamId'}).orderBy('preferredName'),
      user: r.table('User').getAll(org.id, newTeam.orgId, {index: 'userOrgs'}).orderBy('preferredName')
    }, trimSnapshot);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot()).toMatchSnapshot();
  });
});
