import getRethink from 'server/database/rethinkDriver';
import addBilling from 'server/graphql/models/Organization/addBilling/addBilling';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import stripe from 'server/billing/stripe';
import MockDate from 'mockdate';
import mockNow from 'server/__tests__/setup/mockNow';
import fetchAndTrim from 'server/__tests__/utils/fetchAndTrim';
import TrimSnapshot from 'server/__tests__/utils/TrimSnapshot';
import MockDB from 'server/__tests__/setup/MockDB';
import {TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';

MockDate.set(mockNow);
console.error = jest.fn();
const now = new Date();

test('add billing to existing org in a trial period', async () => {
  // SETUP
  const r = getRethink();
  const trimSnapshot = new TrimSnapshot();
  const mockDB = new MockDB();
  const {user, organization} = await mockDB.init()
    .newNotification(undefined, {type: TRIAL_EXPIRES_SOON});
  const org = organization[0];
  stripe.__setMockData(org, trimSnapshot);
  const stripeToken = 'tok_4242424242424242';
  const orgId = org.id;
  const authToken = mockAuthToken(user[0]);
  const socket = {};

  // TEST
  await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});

  // VERIFY
  const db = await fetchAndTrim({
    organization: r.table('Organization').get(orgId),
    notification: r.table('Notification').getAll(orgId, {index: 'orgId'})
  }, trimSnapshot);
  expect(db).toMatchSnapshot();
  expect(stripe.__snapshot()).toMatchSnapshot();
});

test.only('add billing to existing org after trial period', async () => {
  // SETUP
  const r = getRethink();
  const trimSnapshot = new TrimSnapshot();
  const mockDB = new MockDB();
  const stripeToken = 'tok_4242424242424242';
  const {user, organization} = await mockDB.init()
    .newNotification(undefined, {type: TRIAL_EXPIRED})
    .org(0, {periodEnd: new Date(now.getTime() - 1)});
  const org = organization[0];
  stripe.__setMockData(org, trimSnapshot);
  const orgId = org.id;
  const authToken = mockAuthToken(user[0]);
  const socket = {};

  // TEST
  await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});

  // VERIFY
  const db = await fetchAndTrim({
    organization: r.table('Organization').get(orgId),
    notification: r.table('Notification').getAll(orgId, {index: 'orgId'})
  }, trimSnapshot);
  expect(db).toMatchSnapshot();
  expect(stripe.__snapshot()).toMatchSnapshot();
});
