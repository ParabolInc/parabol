import fetchAllLines from 'server/billing/helpers/fetchAllLines';
import generateInvoice from 'server/billing/helpers/generateInvoice';
import stripe from 'server/billing/stripe';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';

export default async function handleInvoiceCreated(invoiceId) {
  const stripeLineItems = await fetchAllLines(invoiceId);
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const {metadata: {orgId}} = await stripe.customers.retrieve(invoice.customer);
  await resolvePromiseObj({
    newInvoice: generateInvoice(invoice, stripeLineItems, orgId, invoiceId),
    updatedStripeMetadata: stripe.invoices.update(invoiceId, {metadata: {orgId}})
  });
  return true;
}
