import stripe from 'server/billing/stripe';

export default async function fetchAllLines(invoiceId, customerId) {
  const stripeLineItems = [];
  const options = {limit: 100};
  // used for upcoming invoices
  if (customerId) {
    options.customer = customerId;
  }
  for (let i = 0; i < 100; i++) {
    if (i > 0) {
      options.starting_after = stripeLineItems[stripeLineItems.length - 1].id;
    }
    const invoiceLines = await stripe.invoices.retrieveLines(invoiceId, options);
    stripeLineItems.push(...invoiceLines.data);
    if (!invoiceLines.has_more) break;
  }
  return stripeLineItems;
};
