import shortid from 'shortid';

import stripe from '../../billing/stripe';
import {toEpochSeconds} from '../../utils/epochTime';

export function mockStripeCustomersCreate() {
  stripe.customers.create = jest.fn((options) => {
    const id = `cust_${shortid.generate()}`;
    const {metadata} = options;
    return {
      id,
      object: 'customer',
      created: toEpochSeconds(new Date()),
      currency: null,
      default_source: null,
      delinquent: false,
      description: null,
      discount: null,
      email: null,
      livemode: false,
      metadata,
      shipping: null,
      sources: {
        object: 'list',
        data: [],
        has_more: false,
        total_count: 0,
        url: `/v1/customers/${id}/sources`
      },
      subscriptions: {
        object: 'list',
        data: [],
        has_more: false,
        total_count: 0,
        url: `/v1/customers/${id}/subscriptions`
      }
    };
  });
}

export function mockStripeSubscriptionsCreate() {
  stripe.subscriptions.create = jest.fn(() => {
    const stripeSubscriptionId = `sub_${shortid.generate()}`;
    const PERIOD_LENGTH = 2592000;
    const now = toEpochSeconds(new Date());
    return {
      stripeSubscriptionId,
      current_period_start: now,
      current_period_end: now + PERIOD_LENGTH
    };
  });
}

export function mockStripeSubscriptionsUpdate() {
  stripe.subscriptions.update = jest.fn(() => true);
}
