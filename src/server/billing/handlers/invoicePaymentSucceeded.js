import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import {PAID} from 'universal/utils/constants';
import {errorObj} from 'server/utils/utils';

/*
 * Simply update our pretty invoice
 */
export default async function invoicePaymentSucceeded(invoiceId) {
  const r = getRethink();
  const now = new Date();
  // VALIDATION
  const {customer: customerId, subscription, paid} = await stripe.invoices.retrieve(invoiceId);
  const {metadata: {orgId}} = await stripe.customers.retrieve(customerId);
  const org = await r.table('Organization').get(orgId);
  if (!org) {
    throw errorObj({_error: `Payment cannot succeed. Org ${orgId} does not exist for invoice ${invoiceId}`});
  }
  const {creditCard, stripeSubscriptionId} = org;
  if (!paid || stripeSubscriptionId !== subscription) {
    throw new Error(`Possible nefarious activity. Bad invoiceId received: ${invoiceId}`);
  }

  // RESOLUTION
  // this must have not been a trial (or it was and they entered a card that got invalidated <1 hr after entering it)
  await r.table('Invoice').get(invoiceId).update({
    creditCard,
    paidAt: now,
    status: PAID
  });
}
