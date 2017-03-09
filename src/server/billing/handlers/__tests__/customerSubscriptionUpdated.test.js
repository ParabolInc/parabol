import getRethink from 'server/database/rethinkDriver';
import stripe from 'server/billing/stripe';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import customerSubscriptionUpdated from 'server/billing/handlers/customerSubscriptionUpdated';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import expectAsyncToThrow from 'server/__tests__/utils/expectAsyncToThrow';

console.error = jest.fn();

describe('customerSubscriptionUpdated', () => {
  test('handles a trial that just expired', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {organization, team} = await mockDB
      .init();
    const org = organization[0];
    stripe.__setMockData(org);
    const {id: orgId, stripeSubscriptionId} = org;
    stripe.__db.subscriptions[stripeSubscriptionId].status = 'active';

    // TEST
    await customerSubscriptionUpdated(stripeSubscriptionId, 'trialing');
    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
      team: r.table('Team').get(team[0].id),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });

  test('exits if called on a non-trialing member', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const stripeToken = 'tok_4242424242424242';
    const {organization, team} = await mockDB
      .init()
      .org(0, {creditCard: creditCardByToken[stripeToken]});
    const org = organization[0];
    stripe.__setMockData(org);
    const {id: orgId, stripeSubscriptionId} = org;

    // TEST
    await customerSubscriptionUpdated(stripeSubscriptionId, 'trialing');

    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
      team: r.table('Team').get(team[0].id),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();

  });

  test('exits if it isn\'t a switch from trialing to active', async() => {
    // SETUP
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const stripeToken = 'tok_4242424242424242';
    const {organization, team} = await mockDB
      .init()
      .org(0, {creditCard: creditCardByToken[stripeToken]});
    const org = organization[0];
    stripe.__setMockData(org);
    const {id: orgId, stripeSubscriptionId} = org;

    // TEST
    await customerSubscriptionUpdated(stripeSubscriptionId, 'active');
    // VERIFY
    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
      team: r.table('Team').get(team[0].id),
      notification: r.table('Notification').getAll(orgId, {index: 'orgId'}),
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });
});

