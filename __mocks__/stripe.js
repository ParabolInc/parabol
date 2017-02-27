import {toEpochSeconds} from 'server/utils/epochTime';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import ms from 'ms';
import shortid from 'shortid';

const stripe = jest.genMockFromModule('stripe');

const updateFromOptions = (doc, handlers, updates, reject) => {
  Object.keys(updates).forEach((updateKey) => {
    const newVal = updates[updateKey];
    const specialHandler = handlers[updateKey];
    if (specialHandler) {
      specialHandler(doc, newVal, reject);
    } else {
      doc[updateKey] = newVal;
    }
  })
};

const checkTouchedEntity = (resourceName) => {
  const resource = stripe[resourceName];
  const keys = resource.__triggers;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (resource[key].mock.calls.length > 0) {
      return true;
    }
  }
  return false
};

const getDoc = (doc, reject) => {
  if (!doc) {
    reject(new Error(`Doc does not exist ${doc}`))
  }
  return doc;
};

const defaultSubscriptionPlan = {
  id: 'action-monthly-test',
  name: 'Action Monthly | TEST',
  amount: 19999900
};

const getQuantity = (orgUsers) => orgUsers.reduce((count, user) => user.inactive ? count : count + 1, 0);

const deletedReturnVal = (id) => ({
  deleted: true,
  id
});

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
  const {customer} = overrides;
  let card;
  if (source) {
    card = creditCardByToken[source];
    if (!card) {
      reject(new Error(`No such token: ${source}`));
    }
  }
  return {
    "id": customer,
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
      "data": card ? [makeSourceObject(card, customer)] : null,
      "has_more": false,
      "total_count": 1,
      "url": `/v1/customers/${customer}/sources`
    }
  }
};

const makeSubscriptionPlan = (created) => ({
  ...defaultSubscriptionPlan,
  "object": "plan",
  "created": created,
  "currency": "usd",
  "interval": "month",
  "interval_count": 1,
  "livemode": false,
  "metadata": {},
  "statement_descriptor": null,
  "trial_period_days": null
});

const makeSubscriptionItem = (created, quantity) => ({
  "id": 'si_123',
  "object": "subscription_item",
  "created": created,
  "plan": makeSubscriptionPlan(created),
  quantity
});

const createNewSubscription = (options, overrides = {}, reject) => {
  const {customer, metadata, quantity = 1, trial_end, trial_period_days} = options;
  if (trial_end && trial_period_days) {
    reject(new Error('Both trial_end and trial_period_days provided'));
  }
  if (!customer) {
    reject(new Error('Customer must be provided'))
  }
  const now = new Date();
  const nowInSeconds = toEpochSeconds(now);
  const defaultEndInSeconds = toEpochSeconds(now.setMonth(now.getMonth() + 1));
  const {
    id,
    created = nowInSeconds,
    current_period_end = defaultEndInSeconds,
    current_period_start = nowInSeconds
  } = overrides;
  let trialEnd = trial_end === 'now' ? nowInSeconds : trial_end;
  trialEnd = trial_period_days ? nowInSeconds + toEpochSeconds(ms(`${trial_period_days}d`)) : trialEnd;
  return {
    "id": id,
    "object": "subscription",
    "application_fee_percent": null,
    "cancel_at_period_end": false,
    "canceled_at": null,
    "created": created,
    "current_period_end": current_period_end,
    "current_period_start": current_period_start,
    "customer": customer,
    "discount": null,
    "ended_at": null,
    "items": {
      "object": "list",
      "data": [makeSubscriptionItem(created, quantity)],
      "has_more": false,
      "total_count": 1,
      "url": `/v1/subscription_items?subscription=${id}`
    },
    "livemode": false,
    "metadata": metadata,
    "plan": makeSubscriptionPlan(created),
    "quantity": quantity,
    "start": current_period_start,
    "status": "active",
    "tax_percent": 0.0,
    "trial_end": trialEnd || null,
    "trial_start": trialEnd ? nowInSeconds : null
  }
};

stripe.__db = {
  customers: {},
  subscriptions: {},
};

stripe.__setMockData = (org, trimSnapshot) => {
  let source;
  if (org.creditCard) {
    const tokenIds = Object.keys(creditCardByToken);
    source = tokenIds.find((token) => token.endsWith(org.creditCard.last4));
  }
  const metadata = {orgId: org.id};
  const customerOptions = {
    metadata,
    source
  };
  stripe.__db.customers[org.stripeId] = createNewCustomer(customerOptions, {customer: org.stripeId});

  const subOptions = {
    customer: org.stripeId,
    metadata,
    quantity: getQuantity(org.orgUsers),
    trial_end: org.creditCard ? undefined : toEpochSeconds(org.periodEnd)
  };

  const overrides = {
    id: org.stripeSubscriptionId,
    current_period_end: toEpochSeconds(org.periodEnd),
    current_period_start: toEpochSeconds(org.periodStart),
  };
  stripe.__db.subscriptions[org.stripeSubscriptionId] = createNewSubscription(subOptions, overrides);
  stripe.__trimSnapshot = trimSnapshot;
};

stripe.__snapshot = () => {
  // create a minimum viable snapshot including everything that got touched
  const snapshot = {};
  const resourceNames = Object.keys(stripe.__db);
  for (let i = 0; i < resourceNames.length; i++) {
    const resourceName = resourceNames[i];
    if (checkTouchedEntity(resourceName)) {
      const resource = stripe[resourceName];
      if (!resource || !resource.__trimFields) {
        throw new Error(`BAD MOCK: No __trimFields set for ${resourceName}`);
      }
      snapshot[resourceName] = stripe.__trimSnapshot.trim(stripe.__db[resourceName], resource.__trimFields);
    }
  }
  return snapshot;
};

stripe.customers = {
  create: jest.fn((options) => new Promise((resolve, reject) => {
    const customer = `cus_${shortid.generate()}`;
    const customerDoc = stripe.__db.customers.push(createNewCustomer(options, {customer}, reject));
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
  __updateHandlers: {
    source: (mockObj, source, reject) => {
      const card = creditCardByToken[source];
      if (!card) {
        reject(new Error(`No such token: ${source}`));
      }
      mockObj.default_source = card.id;
      mockObj.sources.data = [makeSourceObject(card, stripe.customers.__db.id)];
    }
  }
};

stripe.subscriptions = {
  create: jest.fn((options) => new Promise((resolve, reject) => {
    const overrides = {
      id: `sub_${shortid.generate()}`
    };
    const subscriptionDoc = stripe.__db.customers.push(createNewSubscription(options, overrides, reject));
    resolve(subscriptionDoc);
  })),
  retrieve: jest.fn((id) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.subscriptions[id], reject);
    resolve(doc);
  })),
  update: jest.fn((id, options) => new Promise((resolve, reject) => {
    const doc = getDoc(stripe.__db.subscriptions[id], reject);
    updateFromOptions(doc, stripe.subscriptions.__updateHandlers, options, reject);
    resolve(doc);
  })),
  del: jest.fn((id) => new Promise((resolve, reject) => {
    getDoc(stripe.__db.subscriptions[id], reject);
    delete stripe.__db.subscriptions[id];
    resolve(deletedReturnVal(id));
  })),
  __trimFields: ['customer', 'id', 'items.url', 'metadata.orgId'],
  __triggers: ['update', 'del', 'create'],
  __updateHandlers: {
    customer: (mockObj, customer) => mockObj.id = customer,
    plan: (mockObj, planName) => mockObj.plan.name = planName,
    trial_period_days: (mockObj, tpd) => {
      const now = new Date();
      const nowInSeconds = toEpochSeconds(now);
      const endInSeconds = nowInSeconds + toEpochSeconds(ms(`${tpd}d`));
      mockObj.trial_start = nowInSeconds;
      mockObj.trial_end = endInSeconds;
      mockObj.current_period_start = nowInSeconds;
      mockObj.current_period_end = endInSeconds;
    },
    trial_end: (mockObj, trialEnd) => {
      mockObj.trial_end = trialEnd;
      mockObj.current_period_end = trialEnd;
    }
  }
};

// TODO the snapshot method is not thread-safe. let's see if jest solves this
const initStripe = () => stripe;
module.exports = initStripe;
