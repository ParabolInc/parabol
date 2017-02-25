import addBilling from 'server/__tests__/Organization/addBilling';
import orgGenerator from 'server/__tests__/Organization/data/orgGenerator.js';
import cleanupOrgData from 'server/__tests__/utils/cleanupOrgData';
import refreshAuthToken from 'server/__tests__/utils/refreshAuthToken';
import {
  mockAuth0AuthenticationClientTokensGetInfo,
  mockAuth0ManagementClientUsersUpdateAppMetadata
} from 'server/__tests__/utils/mockAuth0.js';
import {
  mockStripeCustomersCreate,
  mockStripeSubscriptionsCreate,
  mockStripeSubscriptionsUpdate
} from 'server/__tests__/utils/mockStripe';
import signupTeam from 'server/__tests__/utils/signupTeam';
import signupTeamLeader from 'server/__tests__/utils/signupTeamLeader';

import getRethink from 'server/database/rethinkDriver';

const testOrg = orgGenerator(2);

mockAuth0AuthenticationClientTokensGetInfo(testOrg.allTeamMembers);
mockAuth0ManagementClientUsersUpdateAppMetadata();
mockStripeCustomersCreate();
mockStripeSubscriptionsUpdate();
mockStripeSubscriptionsCreate();
console.error = jest.fn();

afterAll(async() => {
  const r = getRethink();
  await r.getPoolMaster().drain();
});

signupTeamLeader(testOrg.billingLeader);
signupTeam(
  testOrg.team,
  testOrg.billingLeader,
  testOrg.otherTeamMembers,
  () => refreshAuthToken(testOrg.billingLeader.id)
);

addBilling(testOrg.billingLeader);

cleanupOrgData(testOrg.billingLeader, testOrg.otherTeamMembers);
