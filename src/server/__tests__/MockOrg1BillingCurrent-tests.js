import {
  ORG1_ALL_TEAM_MEMBERS,
  ORG1_BILLING_LEADER,
  ORG1_TEAM,
  ORG1_OTHER_TEAM_MEMBERS
} from './orgs/org1.js';
import cleanupTeamAndOrg from './utils/cleanupTeamAndOrg';
import refreshAuthToken from './utils/refreshAuthToken';
import {
  mockAuth0AuthenticationClientTokensGetInfo,
  mockAuth0ManagementClientUsersUpdateAppMetadata
} from './utils/mockAuth0.js';
import {
  mockStripeCustomersCreate,
  mockStripeSubscriptionsCreate,
  mockStripeSubscriptionsUpdate
} from './utils/mockStripe';
import signupTeam from './utils/signupTeam';
import signupTeamLeader from './utils/signupTeamLeader';

import getRethink from '../database/rethinkDriver';
import teamMutation from '../graphql/models/Team/teamMutation';

/*
 * How many rows in the database should this unit test create?
 *
 * This is a sanity check, to make sure tests are updated when the
 * schema changes. If the row count changes, consider adding tests.
 */
const EXPECTED_ROWS_CREATED = 37;

mockAuth0AuthenticationClientTokensGetInfo(ORG1_ALL_TEAM_MEMBERS);
mockAuth0ManagementClientUsersUpdateAppMetadata();
mockStripeCustomersCreate();
mockStripeSubscriptionsUpdate();
mockStripeSubscriptionsCreate();

afterAll(async() => {
  const r = getRethink();
  await r.getPoolMaster().drain();
});

signupTeamLeader(ORG1_BILLING_LEADER);
signupTeam(
  ORG1_TEAM,
  ORG1_BILLING_LEADER,
  ORG1_OTHER_TEAM_MEMBERS,
  () => refreshAuthToken(ORG1_BILLING_LEADER.id)
);

describe('signup team corner case', () => {
  test('createFirstTeam disallows second team', async() => {
    const authToken = await refreshAuthToken(ORG1_BILLING_LEADER.id);
    const {resolve} = teamMutation.createFirstTeam;
    const newTeam = { ...ORG1_TEAM };
    expect(resolve({}, {newTeam}, {authToken})).toThrow();
  });
});

if (process.env.NODE_ENV === 'testing') {
  cleanupTeamAndOrg(
    ORG1_BILLING_LEADER,
    ORG1_OTHER_TEAM_MEMBERS,
    EXPECTED_ROWS_CREATED
  );
}

// TODO:
//   * promote Iron Man as billing leader
//   * call addTeam a bunch
//   * invite others to teams
//   * add current billing information
//   * advance time? generate invoice?
