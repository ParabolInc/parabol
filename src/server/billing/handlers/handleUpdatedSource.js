import stripe from 'stripe';
import getRethink from 'server/database/rethinkDriver';

export default async function handleUpdatedSource(cardId, customerId) {
  const r = getRethink();
  const customer = await stripe.customers.retrieve(customerId);
  const {orgId} = customer.metadata;
  const cards = customer.sources.data;
  const card = cards.find((card) => card.id === cardId);
  if (!card) return undefined;
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
  return undefined;
}
