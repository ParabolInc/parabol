import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import stripe from 'server/billing/stripe';
import stripeWebhookHandler from 'server/billing/stripeWebhookHandler';
import getRethink from 'server/database/rethinkDriver';
import invoiceCreatedEvent from 'server/graphql/mutations/__tests__/mockStripeEvents/invoiceCreatedEvent';
import shortid from 'shortid';
import {PRO} from 'universal/utils/constants';
import MockRes from 'server/__mocks__/MockRes';
import MockReq from 'server/__mocks__/MockReq';

console.error = jest.fn();

describe('stripeCreateInvoice', () => {
  test('handles invoice.created', async () => {
    // SETUP
    const invoiceId = `in_${shortid.generate()}`;
    const req = new MockReq({body: invoiceCreatedEvent(invoiceId)});
    const res = new MockRes();
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {organization} = await mockDB
      .init({plan: PRO});
    const org = organization[0];
    stripe.__setMockData(org);
    const subscription = stripe.__db.subscriptions[org.stripeSubscriptionId];
    await stripe.invoices.create({customer: org.stripeId, id: invoiceId, subscription});

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(res.sendStatus).toBeCalledWith(200);
    const db = await fetchAndSerialize({
      invoice: r.table('Invoice').get(invoiceId)
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });
});

