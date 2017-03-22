import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import getCCFromCustomer from 'server/graphql/models/Organization/addBilling/getCCFromCustomer';

/*
 * This may be triggered from stripe since they send renewed expiration dates
 */
export default async function customerSourceUpdated(customerId) {
  const r = getRethink();
  const customer = await stripe.customers.retrieve(customerId);
  const creditCard = getCCFromCustomer(customer);
  const {metadata: {orgId}} = customer;
  await r.table('Organization').get(orgId)
    .update({creditCard});
}
