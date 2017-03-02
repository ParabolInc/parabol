// import addBilling from './Organization/addBilling';
// import {
//   ORG1_ALL_TEAM_MEMBERS,
//   ORG1_BILLING_LEADER,
//   ORG1_TEAM,
//   ORG1_OTHER_TEAM_MEMBERS
// } from './Organization/data/org1.js';
// import cleanupOrgData from './utils/cleanupOrgData';
// import refreshAuthToken from './utils/refreshAuthToken';
// import {
//   mockAuth0AuthenticationClientTokensGetInfo,
//   mockAuth0ManagementClientUsersUpdateAppMetadata
// } from './utils/mockAuth0.js';
// import {
//   mockStripeCustomersCreate,
//   mockStripeSubscriptionsCreate,
//   mockStripeSubscriptionsUpdate
// } from './utils/mockStripe';
// import signupTeam from './utils/signupTeam';
// import signupTeamLeader from './utils/signupTeamLeader';
// import syncify from './utils/syncify';
//
// import teamMutation from '../graphql/models/Team/teamMutation';
// import userMutation from '../graphql/models/User/userMutation';
// import getRethink from '../database/rethinkDriver';
//
// mockAuth0AuthenticationClientTokensGetInfo(ORG1_ALL_TEAM_MEMBERS);
// mockAuth0ManagementClientUsersUpdateAppMetadata();
// mockStripeCustomersCreate();
// mockStripeSubscriptionsUpdate();
// mockStripeSubscriptionsCreate();
// console.error = jest.fn();
//
// afterAll(async() => {
//   const r = getRethink();
//   await r.getPoolMaster().drain();
// });
//
// signupTeamLeader(ORG1_BILLING_LEADER);
// describe('update user profile', () => {
//   test('update user profile', async() => {
//     const authToken = await refreshAuthToken(ORG1_BILLING_LEADER.id);
//     const expectedName = 'Cpt. America';
//     const {resolve} = userMutation.updateUserProfile;
//     const updatedUser = {
//       id: ORG1_BILLING_LEADER.id,
//       preferredName: expectedName
//     };
//     const result = await resolve({}, {updatedUser}, {authToken});
//     expect(result.id).toBe(ORG1_BILLING_LEADER.id);
//     expect(result.preferredName).toBe(expectedName);
//   });
// });
// signupTeam(
//   ORG1_TEAM,
//   ORG1_BILLING_LEADER,
//   ORG1_OTHER_TEAM_MEMBERS,
//   () => refreshAuthToken(ORG1_BILLING_LEADER.id)
// );
//
// describe('signup team error case', () => {
//   test('createFirstTeam disallows second team', async() => {
//     // SETUP
//     const authToken = await refreshAuthToken(ORG1_BILLING_LEADER.id);
//     const {resolve} = teamMutation.createFirstTeam;
//     const newTeam = { ...ORG1_TEAM };
//     // TEST
//     const syncResolve = await syncify(() =>
//       resolve({}, {newTeam}, {authToken})
//     );
//     // VERIFY
//     expect(syncResolve).toThrow();
//   });
// });
//
// describe('add billing information', () => {
//   addBilling(
//     ORG1_BILLING_LEADER,
//     {testName: 'via organizationMutation.addBilling'}
//   );
// });
//
// if (process.env.NODE_ENV === 'test') {
//   cleanupOrgData(ORG1_BILLING_LEADER, ORG1_OTHER_TEAM_MEMBERS);
// }
//
// // TODO:
// //   * promote Iron Man as billing leader
// //   * call addTeam a bunch
// //   * invite others to teams
// //   * add current billing information
// //   * advance time? generate invoice?
