import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';

/*
 * Triggered when we update the subscription.
 * Currently, we only update the subscription when we change quantity which signifies an add/remove/pause
 */
export default async function handleInvoiceItemCreated(invoiceItemId) {
  const r = getRethink();
  const invoiceItem = await stripe.invoiceItems.retrieve(invoiceItemId);
  const {subscription, period: {start}} = invoiceItem;
  const hook = await r.table('InvoiceItemHook')
    .getAll(start, {index: 'prorationDate'})
    .filter({stripeSubscriptionId: subscription})
    .nth(0)
    .default(null);
  if (hook) {
    const {type, userId} = hook;
    await stripe.invoiceItems.update(invoiceItemId, {
      metadata: {
        type,
        userId
      }
    });
    return true;
  }
  return false;
}
