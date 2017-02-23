import stripe from 'server/billing/stripe';

export default async function fetchAllLines(invoiceId) {
  const stripeLineItems = [];
  for (let i = 0; i < 100; i++) {
    const options = {limit: 100};
    if (i > 0) {
      options.starting_after = stripeLineItems[stripeLineItems.length - 1].id;
    }
    const invoiceLines = await stripe.invoices.retrieveLines(invoiceId, options);
    stripeLineItems.push(...invoiceLines.data);
    if (!invoiceLines.has_more) break;
  }
  return stripeLineItems;
};
