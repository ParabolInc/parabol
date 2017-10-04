import DynamicSerializer from 'dynamic-serializer';
import MockDB from 'server/__tests__/setup/MockDB';
import fetchAndSerialize from 'server/__tests__/utils/fetchAndSerialize';
import stripe from 'server/billing/stripe';
import stripeWebhookHandler from 'server/billing/stripeWebhookHandler';
import getRethink from 'server/database/rethinkDriver';
import invoicePaymentFailedEvent from 'server/graphql/mutations/__tests__/mockStripeEvents/invoicePaymentFailedEvent';
import shortid from 'shortid';
import {PRO} from 'universal/utils/constants';
import MockRes from 'server/__mocks__/MockRes';
import MockReq from 'server/__mocks__/MockReq';

console.error = jest.fn();

describe('stripeFailPayment', () => {
  test('handles invoice.payment_failed', async () => {
    // SETUP
    const invoiceId = `in_${shortid.generate()}`;
    const res = new MockRes();
    const r = getRethink();
    const dynamicSerializer = new DynamicSerializer();
    const mockDB = new MockDB();
    const {organization} = await mockDB
      .init({plan: PRO})
      .newInvoice({id: invoiceId});
    const org = organization[0];
    stripe.__setMockData(org);
    const req = new MockReq({body: invoicePaymentFailedEvent(invoiceId, org.stripeId, org.stripeSubscriptionId)});
    const subscription = stripe.__db.subscriptions[org.stripeSubscriptionId];
    const billingLeaderId = mockDB.db.user[0].id;
    await stripe.invoices.create({customer: org.stripeId, id: invoiceId, subscription});
    stripe.__db.invoices[invoiceId].paid = false;
    // TEST
    await stripeWebhookHandler(req, res);

    // VERIFY
    expect(res.sendStatus).toBeCalledWith(200);
    const db = await fetchAndSerialize({
      invoice: r.table('Invoice').get(invoiceId),
      notification: r.table('Notification')
        .getAll(billingLeaderId, {index: 'userIds'})
        .orderBy('startAt')
    }, dynamicSerializer);
    expect(db).toMatchSnapshot();
    expect(stripe.__snapshot(org.stripeId, dynamicSerializer)).toMatchSnapshot();
  });
});

