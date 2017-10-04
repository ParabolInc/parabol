import shortid from 'shortid';
import {deletedReturnVal, getDoc, updateFromOptions} from './utils';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import {toEpochSeconds} from 'server/utils/epochTime';
import {makeSubscriptionPlan} from './subscriptions';

export const makeInvoiceLine = (overrides) => {
  const now = new Date();
  const nowInSeconds = toEpochSeconds(now);
  const {id, metadata, periodStart, subscription} = overrides;
  return {
    "id": id,
    "object": "line_item",
    "amount": 0,
    "currency": "usd",
    "description": null,
    "discountable": true,
    "livemode": true,
    "metadata": metadata,
    "period": {
      "start": periodStart || 1488909033,
      "end": 1491501033
    },
    "plan": makeSubscriptionPlan(nowInSeconds),
    "proration": false,
    "quantity": 1,
    "subscription": subscription,
    "subscription_item": `si_${shortid.generate()}`,
    "type": "subscription"
  }
};

const makeNextMonthChargesLine = (subscription) => makeInvoiceLine({
  id: subscription.id,
  metadata: {
    orgId: subscription.metadata.orgId
  },
});

const makeInvoiceLines = (id, subscription, lineTypes) => {
  const totalCount = lineTypes ? Object.keys(lineTypes).reduce((count, type) => count + lineTypes[type], 0) : undefined;
  return {
    "data": [
      makeNextMonthChargesLine(subscription),
    ],
    "total_count": totalCount,
    "object": "list",
    "url": `/v1/invoices/${id}/lines`
  }
};

export const createNewInvoice = (overrides, reject) => {
  const {id, customer, subscription} = overrides;
  return {
    "id": id,
    "object": "invoice",
    "amount_due": 0,
    "application_fee": null,
    "attempt_count": 0,
    "attempted": true,
    "charge": null,
    "closed": true,
    "currency": "usd",
    "customer": customer,
    "date": toEpochSeconds(new Date()),
    "description": null,
    "discount": null,
    "ending_balance": 0,
    "forgiven": false,
    "lines": makeInvoiceLines(id, subscription),
    "livemode": false,
    "metadata": {},
    "next_payment_attempt": null,
    "paid": true,
    "period_end": 1488909033,
    "period_start": 1488909033,
    "receipt_number": null,
    "starting_balance": 0,
    "statement_descriptor": null,
    "subscription": subscription.id,
    "subtotal": 0,
    "tax": null,
    "tax_percent": null,
    "total": 0,
    "webhooks_delivered_at": 1488909040
  }
};

export default (stripe) => ({
   create: jest.fn((options) => new Promise((resolve, reject) => {
     const {id} = options;
     const invoiceDoc = stripe.__db.invoices[id] = createNewInvoice(options, reject);
     resolve(invoiceDoc);
   })),
  retrieve: jest.fn((id) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.invoices[id], reject);
    resolve(doc);
  })),
  retrieveLines: jest.fn((id) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.invoices[id], reject);
    resolve(doc.lines);
  })),
  //TODO
  retrieveUpcoming: jest.fn((id) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.invoices[id], reject);
    resolve(doc);
  })),
  //
  update: jest.fn((id, options) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.invoices[id], reject);
    updateFromOptions(doc, stripe.invoices.__updateHandlers, options, reject);
    resolve(doc)
  })),
  del: jest.fn((id) => new Promise((resolve, reject) => {
    getDoc(stripe.__db.invoices[id], reject);
    delete stripe.__db.invoices[id];
    resolve(deletedReturnVal(id));
  })),
  __trimFields: [
    'id',
    'customer',
    'metadata.orgId',
    'subscription',
    'lines.url',
    'lines.data.id',
    'lines.data.metadata.orgId',
    'lines.data.subscription_item'
  ],
  __triggers: ['update', 'del'],
  __uniqueKeyField: 'customer',
  __updateHandlers: {}
});
