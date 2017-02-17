import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import {fromEpochSeconds} from 'server/utils/epochTime';

export default async function handleSuccessfulPayment(subscriptionId) {
  const r = getRethink();
  const subscription = await stripe.customers.retrieve(subscriptionId);
  const {metadata: {orgId}, current_period_end, current_period_start} = subscription;

  // flag teams as paid, in case they weren't already
  await r.table('Team')
    .getAll(orgId, {index: 'orgId'})
    .update({
      isPaid: true
    })
    .do(() => {
      return r.table('Organization').get(orgId).update({
        periodStart: fromEpochSeconds(current_period_start),
        periodEnd: fromEpochSeconds(current_period_end),
      })
    });
  return true;
}
