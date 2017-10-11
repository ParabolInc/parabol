import shortid from 'shortid';
import {deletedReturnVal, getDoc, updateFromOptions} from './utils';
import {toEpochSeconds} from 'server/utils/epochTime';
import {ACTION_MONTHLY} from 'server/utils/serverConstants';
import {MONTHLY_PRICE} from 'universal/utils/constants';
import ms from 'ms';

const defaultSubscriptionPlan = {
  id: 'action-monthly',
  name: ACTION_MONTHLY,
  amount: MONTHLY_PRICE * 100
};

export const makeSubscriptionPlan = (created) => ({
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

export const createNewSubscription = (options, overrides = {}, reject) => {
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
  let status = current_period_end < nowInSeconds ? 'canceled' : 'active';
  if (trialEnd && status === 'active') {
    status = 'trialing'
  }
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
    "status": status,
    "tax_percent": 0.0,
    "trial_end": trialEnd || null,
    "trial_start": trialEnd ? nowInSeconds : null
  }
};

export default (stripe) => ({
  create: jest.fn((options) => new Promise((resolve, reject) => {
    const id = `sub_${shortid.generate()}`;
    const doc = stripe.__db.subscriptions[id] = createNewSubscription(options, {id}, reject);
    resolve(doc);
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
  __uniqueKeyField: 'customer',
  __updateHandlers: {
    customer: (mockDoc, customer) => mockDoc.id = customer,
    plan: (mockDoc, planName) => mockDoc.plan.name = planName,
    trial_period_days: (mockDoc, tpd) => {
      const now = new Date();
      const nowInSeconds = toEpochSeconds(now);
      const endInSeconds = nowInSeconds + toEpochSeconds(ms(`${tpd}d`));
      mockDoc.trial_start = nowInSeconds;
      mockDoc.trial_end = endInSeconds;
      mockDoc.current_period_start = nowInSeconds;
      mockDoc.current_period_end = endInSeconds;
    },
    trial_end: (mockDoc, trialEnd) => {
      mockDoc.trial_end = trialEnd;
      mockDoc.current_period_end = trialEnd;
    }
  }
});
