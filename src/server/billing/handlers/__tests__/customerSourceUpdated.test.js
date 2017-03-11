import getRethink from 'server/database/rethinkDriver';
import stripe from 'server/billing/stripe';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import customerSourceUpdated from 'server/billing/handlers/customerSourceUpdated';

console.error = jest.fn();

describe('customerSourceUpdated', () => {
  test('handles stripe updating the credit card', async() => {
    // SETUP
    try {
      const r = getRethink();
    } catch(e) {
      throw e
    }
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const oldToken = 'tok_4012888888881881';
    const oldCard = creditCardByToken[oldToken];
    try {
      const {organization} = await mockDB
        .newOrg({creditCard: oldCard});
    } catch(e) {
      throw e
    }
    const {organization} = await mockDB
      .newOrg({creditCard: oldCard});
    console.log('made mockdb')
    const org = organization[0];
    stripe.__setMockData(org);
    const {id: orgId, stripeId} = org;
    stripe.__db.customers[stripeId].sources.data[0].exp_year = '2030';

    // TEST
    try {
      await customerSourceUpdated(stripeId);
    } catch(e) {
      console.log('mut itself', e)
      throw e
    }

    // VERIFY
    console.log('pre-verify')
    try {

    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
    }, dynamicSerializer);
    } catch(e) {
      throw e
    }
    const db = await fetchAndSerialize({
      organization: r.table('Organization').get(orgId),
    }, dynamicSerializer);
    console.log('post fetch seri')
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });
});

