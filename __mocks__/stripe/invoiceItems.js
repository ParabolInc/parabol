import {getDoc, updateFromOptions} from './utils';
import {makeInvoiceLine} from './invoices';

export default (stripe) => ({
  create: jest.fn((options) => new Promise((resolve) => {
    const {id} = options;
    const invoiceDoc = stripe.__db.invoiceItems[id] = makeInvoiceLine(options);
    resolve(invoiceDoc);
  })),
  retrieve: jest.fn((id) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.invoiceItems[id], reject);
    resolve(doc);
  })),
  update: jest.fn((id, options) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.invoiceItems[id], reject);
    updateFromOptions(doc, stripe.invoiceItems.__updateHandlers, options, reject);
    resolve(doc)
  })),
  __trimFields: [
    'id',
    'customer',
    'metadata.userId',
    'subscription',
    'subscription_item'
  ],
  __triggers: ['update'],
  __uniqueKeyField: 'subscription',
  __updateHandlers: {}
});