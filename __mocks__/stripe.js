import {toEpochSeconds} from 'server/utils/epochTime';
import creditCardByToken from 'server/__tests__/utils/creditCardByToken';
import subscriptions, {createNewSubscription} from './stripe/subscriptions';
import customers, {createNewCustomer} from './stripe/customers';
import invoices from './stripe/invoices';
import {getQuantity} from './stripe/utils';
import {usedResources} from 'server/billing/constants';
import webhooks from './stripe/webhooks';
import invoiceItems from './stripe/invoiceItems';

const stripe = jest.genMockFromModule('stripe');
stripe.customers = customers(stripe);
stripe.subscriptions = subscriptions(stripe);
stripe.invoices = invoices(stripe);
stripe.invoiceItems = invoiceItems(stripe);
stripe.webhooks = webhooks;
stripe.__db = usedResources.reduce((db, key) => {
  db[key] = {};
  return db;
}, {});

const checkTouchedEntity = (resourceName) => {
  const resource = stripe[resourceName];
  const keys = resource.__triggers || [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (resource[key].mock.calls.length > 0) {
      return true;
    }
  }
  return false
};

stripe.__setMockData = (org) => {
  let source;
  if (org.creditCard.last4) {
    const tokenIds = Object.keys(creditCardByToken);
    source = tokenIds.find((token) => token.endsWith(org.creditCard.last4));
  }
  const customerOptions = {
    metadata: {orgId: org.id},
    source
  };
  stripe.__db.customers[org.stripeId] = createNewCustomer(customerOptions, {id: org.stripeId});

  const subOptions = {
    customer: org.stripeId,
    metadata: {orgId: org.id},
    quantity: getQuantity(org.orgUsers),
    trial_end: org.creditCard.last4 ? undefined : toEpochSeconds(org.periodEnd)
  };

  const overrides = {
    id: org.stripeSubscriptionId,
    current_period_end: toEpochSeconds(org.periodEnd),
    current_period_start: toEpochSeconds(org.periodStart),
  };
  stripe.__db.subscriptions[org.stripeSubscriptionId] = createNewSubscription(subOptions, overrides);
};

stripe.__snapshot = (uniqueKeyId, dynamicSerializer) => {
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
      snapshot[resourceName] = [];
      const table = stripe.__db[resourceName];
      // TODO we'll eventually need to pass in an object instead of uniqueKeyId to support multivariate lookups
      const uniqueKeyField = resource.__uniqueKeyField || 'customer';
      const docIds = Object.keys(table);
      for (let j = 0; j < docIds.length; j++) {
        const docId = docIds[j];
        const doc = table[docId];

        if (doc[uniqueKeyField] === uniqueKeyId) {
          snapshot[resourceName].push(dynamicSerializer.toStatic(table[docId], resource.__trimFields));
        }
      }
      if (snapshot[resourceName].length === 0) {
        delete snapshot[resourceName]
      }
    }
  }
  return snapshot;
};

// TODO the snapshot method is not thread-safe. let's see if jest solves this
const initStripe = () => stripe;
module.exports = initStripe;
