// import getRethink from 'server/database/rethinkDriver';
// import addBilling from 'server/graphql/models/Organization/addBilling/addBilling';
// import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
// import stripe from 'server/billing/stripe';
// import MockDate from 'mockdate';
// import mockNow from 'server/__tests__/setup/mockNow';
// import fetchAndTrim from 'server/__tests__/utils/fetchAndTrim';
// import TrimSnapshot from 'server/__tests__/utils/TrimSnapshot';
// import MockDB from 'server/__tests__/setup/MockDB';
// import {PAYMENT_REJECTED, TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';
// import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
//
// MockDate.set(mockNow);
// console.error = jest.fn();
// const now = new Date();
// describe('addOrg', () => {
//   test('extends trial for those still in trial period', async() => {
//     // SETUP
//     const r = getRethink();
//     const trimSnapshot = new TrimSnapshot();
//     const mockDB = new MockDB();
//     const {user, organization} = await mockDB.init()
//       .newNotification(undefined, {type: TRIAL_EXPIRES_SOON});
//     const org = organization[0];
//     stripe.__setMockData(org, trimSnapshot);
//     const stripeToken = 'tok_4242424242424242';
//     const orgId = org.id;
//     const authToken = mockAuthToken(user[0]);
//     const socket = {};
//
//     // TEST
//     await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});
//
//     // VERIFY
//     const db = await fetchAndTrim({
//       organization: r.table('Organization').get(orgId),
//       notification: r.table('Notification').getAll(orgId, {index: 'orgId'})
//     }, trimSnapshot);
//     expect(db).toMatchSnapshot();
//     expect(stripe.__snapshot()).toMatchSnapshot();
//   });
//
//   test('starts a new subscription for those who let the trial expire', async() => {
//     // SETUP
//     const r = getRethink();
//     const trimSnapshot = new TrimSnapshot();
//     const mockDB = new MockDB();
//     const stripeToken = 'tok_4242424242424242';
//     const {user, team, organization} = await mockDB.init()
//       .newNotification(undefined, {type: TRIAL_EXPIRED})
//       .org(0, {periodEnd: new Date(now.getTime() - 1)})
//       .team(0, {isPaid: false});
//     const org = organization[0];
//     stripe.__setMockData(org, trimSnapshot);
//     const orgId = org.id;
//     const authToken = mockAuthToken(user[0]);
//     const socket = {};
//
//     // TEST
//     await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});
//
//     // VERIFY
//     const db = await fetchAndTrim({
//       organization: r.table('Organization').get(orgId),
//       notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
//       team: r.table('Team').get(team[0].id)
//     }, trimSnapshot);
//     expect(db).toMatchSnapshot();
//     expect(stripe.__snapshot()).toMatchSnapshot();
//   });
//
//   test('changes cards for customers in good standing', async() => {
//     // SETUP
//     const r = getRethink();
//     const trimSnapshot = new TrimSnapshot();
//     const mockDB = new MockDB();
//     const oldToken = 'tok_4012888888881881';
//     const {user, team, organization} = await mockDB.init()
//       .org(0, {creditCard: creditCardByToken[oldToken]});
//     const org = organization[0];
//     stripe.__setMockData(org, trimSnapshot);
//     const orgId = org.id;
//     const authToken = mockAuthToken(user[0]);
//     const socket = {};
//
//     // TEST
//     const stripeToken = 'tok_4242424242424242';
//     await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});
//
//     // VERIFY
//     const db = await fetchAndTrim({
//       organization: r.table('Organization').get(orgId),
//       // notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
//       // team: r.table('Team').get(team[0].id)
//     }, trimSnapshot);
//     expect(db).toMatchSnapshot();
//     expect(stripe.__snapshot()).toMatchSnapshot();
//   });
//
//   test('changes cards for customers in good standing', async() => {
//     // SETUP
//     const r = getRethink();
//     const trimSnapshot = new TrimSnapshot();
//     const mockDB = new MockDB();
//     const oldToken = 'tok_4012888888881881';
//     const {user, organization} = await mockDB.init()
//       .org(0, {creditCard: creditCardByToken[oldToken]});
//     const org = organization[0];
//     stripe.__setMockData(org, trimSnapshot);
//     const orgId = org.id;
//     const authToken = mockAuthToken(user[0]);
//     const socket = {};
//
//     // TEST
//     const stripeToken = 'tok_4242424242424242';
//     await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});
//
//     // VERIFY
//     const db = await fetchAndTrim({
//       organization: r.table('Organization').get(orgId),
//       // notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
//       // team: r.table('Team').get(team[0].id)
//     }, trimSnapshot);
//     expect(db).toMatchSnapshot();
//     expect(stripe.__snapshot()).toMatchSnapshot();
//   });
//
//   test('changes cards for customer who had a failed charge', async() => {
//     // SETUP
//     const r = getRethink();
//     const trimSnapshot = new TrimSnapshot();
//     const mockDB = new MockDB();
//     const oldToken = 'tok_4000000000000341';
//     const {user, team, organization} = await mockDB.init()
//       .org(0, {
//         creditCard: creditCardByToken[oldToken],
//         periodEnd: new Date(now.getTime() - 1)
//       })
//       .newNotification(undefined, {type: PAYMENT_REJECTED});
//     const org = organization[0];
//     stripe.__setMockData(org, trimSnapshot);
//     const orgId = org.id;
//     const authToken = mockAuthToken(user[0]);
//     const socket = {};
//
//     // TEST
//     const stripeToken = 'tok_4242424242424242';
//     await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});
//
//     // VERIFY
//     const db = await fetchAndTrim({
//       organization: r.table('Organization').get(orgId),
//       notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
//       team: r.table('Team').get(team[0].id)
//     }, trimSnapshot);
//     expect(db).toMatchSnapshot();
//     expect(stripe.__snapshot()).toMatchSnapshot();
//   });
//
//   test('throws when no websocket is present', async() => {
//     const authToken = {};
//     try {
//       await addBilling.resolve(undefined, {orgId: null, stripeToken: null}, {authToken})
//     } catch(e) {
//       expect(() => {throw e}).toThrowErrorMatchingSnapshot();
//     }
//   });
//
//   test('throw when the caller is not an org leader', async() => {
//     // SETUP
//     const mockDB = new MockDB();
//     const {user, organization} = await mockDB.init();
//     const orgId = organization[0].id;
//     const authToken = mockAuthToken(user[1]);
//     const socket = {};
//
//     // TEST
//     try {
//       await addBilling.resolve(undefined, {orgId, stripeToken: null}, {authToken, socket});
//     } catch(e) {
//       expect(() => {throw e}).toThrowErrorMatchingSnapshot();
//     }
//   });
//
//   test('thrown when a bad source token is provided', async() => {
//     // SETUP
//     const mockDB = new MockDB();
//     const {user, organization} = await mockDB.init();
//     const authToken = mockAuthToken(user[0]);
//     const orgId = organization[0].id;
//     const socket = {};
//     // TEST
//     const stripeToken = 'BAD_TOKEN';
//     try {
//       await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket})
//     } catch(e) {
//       expect(() => {throw e}).toThrowErrorMatchingSnapshot();
//     }
//   });
// });
