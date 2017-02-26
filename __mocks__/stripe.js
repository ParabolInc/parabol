import {toEpochSeconds} from 'server/utils/epochTime';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';

const checkTouchedEntity = (entityName) => {
  const entity = stripe[entityName];
  const keys = entity.__triggers;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (entity[key].mock.calls.length > 0) {
      return true;
    }
  }
  return false
};

const stripe = jest.genMockFromModule('stripe');



const defaultSubscriptionPlan = {
  id: 'action-monthly-test',
  name: 'Action Monthly | TEST',
  amount: 19999900
};

const getQuantity = (org) => org.orgUsers.reduce((count, user) => user.inactive ? count : count + 1, 0);

const deletedReturnVal = (id) => ({
  deleted: true,
  id
});

const makeSourceObject = (creditCard, stripeId) => ({
  "id": 'card_123',
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

const makeCustomerObject = (org) => ({
  "id": org.stripeId,
  "object": "customer",
  "account_balance": 0,
  "created": toEpochSeconds(org.createdAt),
  "currency": "usd",
  "default_source": org.creditCard ? 'card_123' : null,
  "delinquent": false,
  "description": null,
  "discount": null,
  "email": null,
  "livemode": false,
  "metadata": {
    "orgId": org.id
  },
  "shipping": null,
  "sources": {
    "object": "list",
    "data": org.creditCard ? [makeSourceObject(org.creditCard)] : null,
    "has_more": false,
    "total_count": 1,
    "url": `/v1/customers/${org.stripeId}/sources`
  }
});

const makeSubscriptionPlan = (org) => ({
  ...defaultSubscriptionPlan,
  "object": "plan",
  "created": toEpochSeconds(org.periodStart),
  "currency": "usd",
  "interval": "month",
  "interval_count": 1,
  "livemode": false,
  "metadata": {},
  "statement_descriptor": null,
  "trial_period_days": null
});

const makeSubscriptionItem = (org) => ({
  "id": 'si_123',
  "object": "subscription_item",
  "created": toEpochSeconds(org.periodStart),
  "plan": makeSubscriptionPlan(org),
  quantity: getQuantity(org)
});

const makeSubscriptionObject = (org) => ({
  "id": org.stripeSubscriptionId,
  "object": "subscription",
  "application_fee_percent": null,
  "cancel_at_period_end": false,
  "canceled_at": null,
  "created": toEpochSeconds(org.createdAt),
  "current_period_end": toEpochSeconds(org.periodEnd),
  "current_period_start": toEpochSeconds(org.periodStart),
  "customer": org.stripeId,
  "discount": null,
  "ended_at": null,
  "items": {
    "object": "list",
    "data": [makeSubscriptionItem(org)],
    "has_more": false,
    "total_count": 1,
    "url": `/v1/subscription_items?subscription=${org.stripeSubscriptionId}`
  },
  "livemode": false,
  "metadata": {
    "orgId": org.id
  },
  "plan": makeSubscriptionPlan(org),
  quantity: getQuantity(org),
  "start": toEpochSeconds(org.periodStart),
  "status": "active",
  "tax_percent": 0.0,
  "trial_end": org.creditCard ? null : toEpochSeconds(org.periodEnd),
  "trial_start": org.creditCard ? null : toEpochSeconds(org.periodStart)
});

stripe.__setMockData = (org, trimSnapshot) => {
  stripe.customers.__mock = makeCustomerObject(org);
  stripe.subscriptions.__mock = makeSubscriptionObject(org);
  stripe.__trimSnapshot = trimSnapshot;
};

stripe.__snapshot = () => {
  // create a minimum viable snapshot including everything that got touched
  const snapshot = {};
  const entityNames = Object.keys(stripe).filter((name) => stripe[name] && stripe[name].__triggers);
  for (let i = 0; i < entityNames.length; i++) {
    const name = entityNames[i];
    if (checkTouchedEntity(name)) {
      const entity = stripe[name];
      snapshot[name] = stripe.__trimSnapshot.trim(entity.__mock, entity.__trimFields);
    }
  }
  return snapshot;
};

stripe.customers = {
  create: jest.fn((options) => new Promise((resolve) => resolve(stripe.customers.__mock))),
  retrieve: jest.fn((customerId) => new Promise((resolve) => resolve(stripe.customers.__mock))),
  update: jest.fn((customerId, options) => new Promise((resolve) => {
    const {source} = options;
    if (source) {
      const card = creditCardByToken[source];
      stripe.customers.__mock.default_source = card.id;
      stripe.customers.__mock.sources.data = [makeSourceObject(card, stripe.customers.__mock.id)];
    }
    resolve(stripe.customers.__mock)
  })),
  del: jest.fn((id) => new Promise((resolve) => resolve(deletedReturnVal(id)))),
  __trimFields: ['id', 'metadata.orgId', 'sources.url', 'sources.data.customer'],
  __triggers: ['update', 'del', 'create']
};

stripe.subscriptions = {
  create: jest.fn((options) => new Promise((resolve) => resolve(stripe.customers.__mock))),
  retrieve: jest.fn((subscriptionId) => new Promise((resolve) => resolve(stripe.customers.__mock))),
  update: jest.fn((subscriptionId, options) => new Promise((resolve) => {
    const {trial_end} = options;
    if (trial_end) {
      stripe.subscriptions.__mock.trial_end = trial_end;
      stripe.subscriptions.__mock.current_period_end = trial_end;
    }
    resolve(stripe.subscriptions.__mock)
  })),
  del: jest.fn((id) => new Promise((resolve) => resolve(deletedReturnVal(id)))),
  __trimFields: ['customer', 'id', 'items.url', 'metadata.orgId'],
  __triggers: ['update', 'del', 'create']
};


const initStripe = () => stripe;
module.exports = initStripe;
