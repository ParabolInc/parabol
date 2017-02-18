import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';

/*
 * This may be triggered from stripe since they send renewed expiration dates
 */
export default async function customerSourceUpdated(cardId, customerId) {
  const r = getRethink();
  const customer = await stripe.customers.retrieve(customerId);
  const {orgId} = customer.metadata;
  const cards = customer.sources.data;
  const card = cards.find((card) => card.id === cardId);
  if (!card) {
    console.warn(`No credit card found! cardId: ${cardId}, customerId: ${customerId}`);
    return false;
  }
  const {brand, last4, exp_month: expMonth, exp_year: expYear} = card;
  const expiry = `${expMonth}/${expYear.substr(2)}`;
  await r.table('Organization').get(orgId)
    .update({
      creditCard: {
        brand,
        last4,
        expiry
      },
    });
  return true;
}
