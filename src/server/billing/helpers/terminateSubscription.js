import getRethink from 'server/database/rethinkDriver';
import stripe from 'server/billing/stripe';

export default async function terminateSubscription(orgId) {
  const r = getRethink();
  const now = new Date();
  // flag teams as unpaid
  const orgDoc = await r.table('Team')
    .getAll(orgId, {index: 'orgId'})
    .update({
      isPaid: false
    })
    .do(() => {
      return r.table('Organization')
        .get(orgId)
        .update({
          // periodEnd should always be redundant, but useful for testing purposes
          // since we test trials by ending them prematurely in stripe and don't always update the doc
          periodEnd: now,
          stripeSubscriptionId: null
        }, {returnChanges: true});
    })('changes')(0)('old_val');
  const {stripeSubscriptionId} = orgDoc;
  // stripe already does this for us (per account settings) but we do it here so we don't have to wait an hour
  // if this function is called by a paymentFailed hook, then the sub may not exist, so catch and release
  if (stripeSubscriptionId) {
    await stripe.subscriptions.del(stripeSubscriptionId).catch(() => {});
  }
  return orgDoc;
}
