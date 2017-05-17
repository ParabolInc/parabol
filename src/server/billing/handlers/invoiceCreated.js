import fetchAllLines from 'server/billing/helpers/fetchAllLines';
import stripe from 'server/billing/stripe';
import generateInvoice from 'server/billing/helpers/generateInvoice';

export default async function handleInvoiceCreated(invoiceId) {
  const stripeLineItems = await fetchAllLines(invoiceId);
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const {metadata: {orgId}} = await stripe.customers.retrieve(invoice.customer);
  await stripe.invoices.update(invoiceId, {metadata: {orgId}});

  await generateInvoice(invoice, stripeLineItems, orgId, invoiceId);
  return true;
}
