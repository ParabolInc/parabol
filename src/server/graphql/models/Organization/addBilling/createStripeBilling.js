import getRethink from 'server/database/rethinkDriver';
import stripe from 'server/billing/stripe';

export default async function createStripeBilling(orgId, stripeToken, validUntil) {
  const r = getRethink();
  const stripeId = await r.table('Organization').get(orgId)('stripeId').default(null);
  const customer = await stripe.customers.update(stripeId, {source: stripeToken});
  const card = customer.sources.data.find((source) => source.id === customer.default_source);
  const {brand, last4, exp_month: expMonth, exp_year: expYear} = card;
  const expiry = `${expMonth}/${String(expYear).substr(2)}`;
  const updateObject = {
    creditCard: {
      brand,
      last4,
      expiry
    }
  };
  if (validUntil !== undefined) {
    updateObject.validUntil = validUntil;
  }
  return r.table('Organization').get(orgId).update(updateObject);
}
