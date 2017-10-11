import DynamicSerializer from 'dynamic-serializer';
import MockReq from 'server/__mocks__/MockReq';
import MockRes from 'server/__mocks__/MockRes';
import MockDB from 'server/__tests__/setup/MockDB';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import stripe from 'server/billing/stripe';
import stripeWebhookHandler from 'server/billing/stripeWebhookHandler';
import getRethink from 'server/database/rethinkDriver';
import invoiceItemCreatedEvent from 'server/graphql/mutations/__tests__/mockStripeEvents/invoiceItemCreatedEvent';
import shortid from 'shortid';
import {PRO} from 'universal/utils/constants';

console.error = jest.fn();

describe('stripeUpdateInvoiceItem', () => {
  test('handles invoiceitem.created', async () => {
    // SETUP
    const hookId = shortid.generate();
    const invoiceItemId = shortid.generate();
    const res = new MockRes();
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {organization, invoiceItemHook} = await mockDB
      .init({plan: PRO})
      .newInvoiceItemHook({id: hookId});

    const org = organization[0];
    const hook = invoiceItemHook[0];
    stripe.__setMockData(org);
    await stripe.invoiceItems.create({
      subscription: org.stripeSubscriptionId,
      id: invoiceItemId,
      metadata: {orgId: org.id},
      periodStart: hook.prorationDate
    });
    const req = new MockReq({body: invoiceItemCreatedEvent(invoiceItemId, org.stripeId, org.stripeSubscriptionId)});

    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(res.sendStatus).toBeCalledWith(200);
    const db = await fetchAndSerialize({
      invoiceItemHook: r.table('InvoiceItemHook').get(hookId)
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeSubscriptionId, dynamicSerializer)).toMatchSnapshot();
  });
});

