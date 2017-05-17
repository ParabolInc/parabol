// use relative important statements since we use this in the backfillInvoices migration
import fetchAllLines from '../helpers/fetchAllLines';
import stripe from '../stripe';
import generateInvoice from '../helpers/generateInvoice';

export default async function handleInvoiceCreated(invoiceId) {
  const stripeLineItems = await fetchAllLines(invoiceId);
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const {metadata: {orgId}} = await stripe.customers.retrieve(invoice.customer);
  await stripe.invoices.update(invoiceId, {metadata: {orgId}});

  await generateInvoice(invoice, stripeLineItems, orgId, invoiceId);
  return true;
}
