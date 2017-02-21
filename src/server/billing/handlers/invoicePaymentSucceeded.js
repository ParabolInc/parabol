import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import {PAID} from 'server/graphql/models/Invoice/invoiceSchema';

/*
 * Simply update our pretty invoice
 */
export default async function invoicePaymentSucceeded(invoiceId) {
  const r = getRethink();

  // VALIDATION
  const {customer: customerId, subscription, paid} = await stripe.invoices.retrieve(invoiceId);
  const {metadata: {orgId}} = await stripe.customers.retrieve(customerId);
  const org = await r.table('Organization').get(orgId);
  const {stripeSubscriptionId} = org;
  if (!paid || stripeSubscriptionId !== subscription) return false;

  // RESOLUTION
  // this must have not been a trial (or it was and they entered a card that got invalidated <1 hr after entering it)
  await r.table('Invoice').get(invoiceId).update({
    status: PAID
  });
  return true;
}
