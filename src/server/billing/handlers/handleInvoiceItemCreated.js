import stripe from 'stripe';
import getRethink from 'server/database/rethinkDriver';

export default async function handleInvoiceItemCreated(invoiceItemId) {
  const r = getRethink();
  const invoiceItem = await stripe.invoiceItems.retrieve(invoiceItemId);
  if (!invoiceItem) {
    console.warn(`No invoice found for ${invoiceItemId}`)
  }
  const {subscription, period: {start}} = invoiceItem;
  const hook = await r.table('InvoiceItemHook')
    .getAll([start, subscription], {index: 'prorationDateSubId'})
    .nth(0);
  if (!hook) {
    console.warn(`No hook found in the DB! Need to manually update invoiceItem: ${invoiceItemId}`);
  }
  const {type, userId} = hook;
  await stripe.invoiceItems.update(invoiceItemId, {
    metadata: {
      type,
      userId
    }
  });
}
