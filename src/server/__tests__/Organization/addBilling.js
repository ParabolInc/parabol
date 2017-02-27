// import shortid from 'shortid';
//
// import refreshAuthToken from '../utils/refreshAuthToken';
// import {mockStripeCustomersUpdate} from '../utils/mockStripe';
//
// import getRethink from 'server/database/rethinkDriver';
// import organizationMutation from 'server/graphql/models/Organization/organizationMutation';
//
// export default function (teamLeader, {testName = 'add billing information'} = {}) {
//   test(testName, async() => {
//     // SETUP
//     const authToken = await refreshAuthToken(teamLeader.id);
//     const r = getRethink();
//     const orgId = await r.table('User').get(teamLeader.id)
//       .do((user) => user('userOrgs').nth(0)('id'));
//     const stripeToken = `tok_${shortid.generate()}`;
//     const socket = jest.fn();
//     const stripeCustomersUpdate = mockStripeCustomersUpdate();
//     const {resolve} = organizationMutation.addBilling;
//     // TEST
//     const result = await resolve({}, {orgId, stripeToken}, {authToken, socket});
//     // VALIDATE
//     expect(result).toBeTruthy();
//     const [stripeId, options] = stripeCustomersUpdate.mock.calls[0];
//     expect(typeof stripeId === 'string').toBeTruthy();
//     expect(stripeId.startsWith('cust_')).toBeTruthy();
//     expect(typeof options === 'object').toBeTruthy();
//     expect(typeof options.source === 'string').toBeTruthy();
//     expect(options.source.startsWith('tok_')).toBeTruthy();
//   });
// }
