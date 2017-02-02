import getRethink from 'server/database/rethinkDriver';
import stripe from 'server/billing/stripe';
import {ACTION_MONTHLY, TRIAL_PERIOD_DAYS} from 'server/utils/serverConstants';
import {fromStripeDate} from 'server/billing/stripeDate';
import {getNewVal} from 'server/utils/utils';

export default async function createStripeOrg(orgId, orgName, isTrial, userId, now = new Date()) {
  const r = getRethink();
  const {id: stripeId} = await stripe.customers.create({
      metadata: {
        orgId
      }
    });
  const {id: stripeSubscriptionId, current_period_end} = await stripe.subscriptions.create({
      customer: stripeId,
      metadata: {
        orgId
      },
      plan: ACTION_MONTHLY,
      trial_period_days: isTrial ? TRIAL_PERIOD_DAYS : 0
    });
  const validUntil = fromStripeDate(current_period_end);
  const res = await r.table('Organization').insert({
      id: orgId,
      activeUsers: [userId],
      createdAt: now,
      inactiveUsers: [],
      isTrial: true,
      name: orgName,
      stripeId,
      stripeSubscriptionId,
      updatedAt: now,
      validUntil
    }, {returnChanges: true});
  return getNewVal(res);
}
