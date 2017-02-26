import getRethink from 'server/database/rethinkDriver';
import createNewOrg from 'server/__tests__/setup/createNewOrg';
import addBilling from 'server/graphql/models/Organization/addBilling/addBilling';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import stripe from 'server/billing/stripe';
import MockDate from 'mockdate';
import mockNow from 'server/__tests__/setup/mockNow';
import fetchAndTrim from 'server/__tests__/utils/fetchAndTrim';

MockDate.set(mockNow);

let docs;
beforeEach(async () => {
  docs = await createNewOrg();
  stripe.__setMockData(docs.org);
});
console.error = jest.fn();

test('add billing to existing org in a trial period', async () => {
  const r = getRethink();
  const {users, org} = docs;
  const stripeToken = 'tok_4242424242424242';
  const orgId = org.id;
  const authToken = mockAuthToken(users[0]);
  const socket = {};
  await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});
  const db = await fetchAndTrim({
    organization: r.table('Organization').get(orgId),
    notification: r.table('Notification').getAll(orgId, {index: 'orgId'})
  });
  expect(db).toMatchSnapshot();
  expect(stripe.customers.__snapshot()).toMatchSnapshot();
  expect(stripe.subscriptions.__snapshot()).toMatchSnapshot();
});
