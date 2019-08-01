import shortid from 'shortid';
import {deletedReturnVal, getDoc, updateFromOptions} from './utils';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import {toEpochSeconds} from 'server/utils/epochTime';

const makeSourceObject = (creditCard, stripeId) => ({
  "id": creditCard.id,
  "object": "card",
  "address_city": null,
  "address_country": null,
  "address_line1": null,
  "address_line1_check": null,
  "address_line2": null,
  "address_state": null,
  "address_zip": null,
  "address_zip_check": null,
  "brand": creditCard.brand,
  "country": "US",
  "customer": stripeId,
  "cvc_check": "pass",
  "dynamic_last4": null,
  "exp_month": creditCard.expiry.substr(0, 2),
  "exp_year": `20${creditCard.expiry.substr(3)}`,
  "funding": "credit",
  "last4": creditCard.last4,
  "metadata": {},
  "name": null,
  "tokenization_method": null
});

export const createNewCustomer = (options, overrides, reject) => {
  const {metadata, source} = options;
  const {id} = overrides;
  let card;
  if (source) {
    card = creditCardByToken[source];
    if (!card) {
      reject(new Error(`No such token: ${source}`));
    }
  }
  return {
    "id": id,
    "object": "customer",
    "account_balance": 0,
    "created": toEpochSeconds(new Date()),
    "currency": "usd",
    "default_source": card ? card.id : null,
    "delinquent": false,
    "description": null,
    "discount": null,
    "email": null,
    "livemode": false,
    "metadata": metadata,
    "shipping": null,
    "sources": {
      "object": "list",
      "data": card ? [makeSourceObject(card, id)] : null,
      "has_more": false,
      "total_count": 1,
      "url": `/v1/customers/${id}/sources`
    }
  }
};

export default (stripe) => ({
  create: jest.fn((options) => new Promise((resolve, reject) => {
    const id = `cus_${shortid.generate()}`;
    const customerDoc = stripe.__db.customers[id] = createNewCustomer(options, {id}, reject);
    resolve(customerDoc);
  })),
    retrieve: jest.fn((id) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.customers[id], reject);
    resolve(doc);
  })),
    update: jest.fn((id, options) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.customers[id], reject);
    updateFromOptions(doc, stripe.customers.__updateHandlers, options, reject);
    resolve(doc)
  })),
    del: jest.fn((id) => new Promise((resolve, reject) => {
    getDoc(stripe.__db.customers[id], reject);
    delete stripe.__db.customers[id];
    resolve(deletedReturnVal(id));
  })),
    __trimFields: ['id', 'metadata.orgId', 'sources.url', 'sources.data.customer'],
    __triggers: ['update', 'del', 'create'],
      __uniqueKeyField: 'id',
    __updateHandlers: {
    source: (mockDoc, source, reject) => {
      const card = creditCardByToken[source];
      if (!card) {
        reject(new Error(`No such token: ${source}`));
      }
      mockDoc.default_source = card.id;
      mockDoc.sources.data = [makeSourceObject(card, mockDoc.id)];
    }
  }
});
