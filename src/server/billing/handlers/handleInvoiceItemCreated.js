import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';

/*
 * Triggered when we update the subscription.
 * Currently, we only update the subscription when we change quantity which signifies an add/remove/pause
 */
export default async function handleInvoiceItemCreated(invoiceItemId) {
  const r = getRethink();
  console.log('invoice item created', invoiceItemId);
  const invoiceItem = await stripe.invoiceItems.retrieve(invoiceItemId);
  if (!invoiceItem) {
    console.warn(`No invoice found for ${invoiceItemId}`)
    return false;
  }
  console.log('invoice item created2', invoiceItem);
  const {subscription, period: {start}} = invoiceItem;
  const hook = await r.table('InvoiceItemHook')
    .getAll(String(start), {index: 'prorationDate'})
    .filter({subId: subscription})
    .nth(0)
    .default(null);
  if (!hook) {
    console.warn(`No hook found in the DB! Need to manually update invoiceItem: ${invoiceItemId}`);
    return false;
  }
  const {type, userId} = hook;
  await stripe.invoiceItems.update(invoiceItemId, {
    metadata: {
      type,
      userId
    }
  });
  return true;
}
