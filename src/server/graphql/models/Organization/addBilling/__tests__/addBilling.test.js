import getRethink from 'server/database/rethinkDriver';
import addBilling from 'server/graphql/models/Organization/addBilling/addBilling';
import mockAuthToken from 'server/__tests__/setup/mockAuthToken';
import stripe from 'server/billing/stripe';
import MockDate from 'mockdate';
import {__now} from 'server/__tests__/setup/mockTimes';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import {PAYMENT_REJECTED, TRIAL_EXPIRES_SOON, TRIAL_EXPIRED} from 'universal/utils/constants';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';
import socket from 'server/__mocks__/socket';
import * as makeUpcomingInvoice from 'server/graphql/models/Invoice/makeUpcomingInvoice';

MockDate.set(__now);
console.error = jest.fn();
const now = new Date();

describe('addBilling', () => {
  test('extends trial for those still in trial period', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {user, organization} = await mockDB.init()
      .newNotification(undefined, {type: TRIAL_EXPIRES_SOON});
    const org = organization[0];
    stripe.__setMockData(org);
    const stripeToken = 'tok_4242424242424242';
    const orgId = org.id;
    const authToken = mockAuthToken(user[0]);
    makeUpcomingInvoice.default = jest.fn(() => ({}));

    // TEST
    await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'})
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });

  test('starts a new subscription for those who let the trial expire', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const stripeToken = 'tok_4242424242424242';
    const {user, team, organization} = await mockDB.init()
      .newNotification(undefined, {type: TRIAL_EXPIRED})
      .org(0, {periodEnd: new Date(now.getTime() - 1)})
      .team(0, {isPaid: false});
    const org = organization[0];
    stripe.__setMockData(org);
    const orgId = org.id;
    const authToken = mockAuthToken(user[0]);
    makeUpcomingInvoice.default = jest.fn(() => ({}));

    // TEST
    await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
      team: r.table('Team').get(team[0].id)
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });

  test('changes cards for customers in good standing', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const oldToken = 'tok_4012888888881881';
    const {user, organization} = await mockDB.init()
      .org(0, {creditCard: creditCardByToken[oldToken]});
    const org = organization[0];
    stripe.__setMockData(org);
    const orgId = org.id;
    const authToken = mockAuthToken(user[0]);
    makeUpcomingInvoice.default = jest.fn(() => ({}));

    // TEST
    const stripeToken = 'tok_4242424242424242';
    await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });

  test('changes cards for customer who had a failed charge', async () => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const oldToken = 'tok_4000000000000341';
    const {user, team, organization} = await mockDB.init()
      .org(0, {
        creditCard: creditCardByToken[oldToken],
        periodEnd: new Date(now.getTime() - 1)
      })
      .newNotification(undefined, {type: PAYMENT_REJECTED});
    const org = organization[0];
    stripe.__setMockData(org);
    const orgId = org.id;
    const authToken = mockAuthToken(user[0]);
    makeUpcomingInvoice.default = jest.fn(() => ({}));

    // TEST
    const stripeToken = 'tok_4242424242424242';

    await addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket});

    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
      team: r.table('Team').get(team[0].id)
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });

  test('throws when no websocket is present', async () => {
    const authToken = {};
    await expectAsyncToThrow(addBilling.resolve(undefined, {orgId: null, stripeToken: null}, {authToken}));
  });

  test('throw when the caller is not an org leader', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user, organization} = await mockDB.init();
    const orgId = organization[0].id;
    const authToken = mockAuthToken(user[1]);

    // TEST
    await expectAsyncToThrow(addBilling.resolve(undefined, {orgId, stripeToken: null}, {authToken, socket}));
  });

  test('thrown when a bad source token is provided', async () => {
    // SETUP
    const mockDB = new MockDB();
    const {user, organization} = await mockDB.init();
    const authToken = mockAuthToken(user[0]);
    const org = organization[0];
    const orgId = org.id;
    stripe.__setMockData(org);

    // TEST
    const stripeToken = 'BAD_TOKEN';
    await expectAsyncToThrow(addBilling.resolve(undefined, {orgId, stripeToken}, {authToken, socket}));
  });
});
