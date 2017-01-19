import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';

export default async function handleSuccessfulPayment(subscriptionId) {
  const r = getRethink();
  const subscription = await stripe.customers.retrieve(subscriptionId);
  const {metadata: {orgId}, period_end: validUntil} = subscription;

  // flag teams as paid, in case they weren't already
  await r.table('Team')
    .getAll(orgId, {index: 'orgId'})
    .update({
      isPaid: true
    })
    // keep isTrial true since we'll use that for the callout
    .do(() => {
      return r.table('Organization').get(orgId).update({
        validUntil
      })
    });
  return true;
}
