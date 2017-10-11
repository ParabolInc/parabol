import fetchAllLines from 'server/billing/helpers/fetchAllLines';
import generateInvoice from 'server/billing/helpers/generateInvoice';
import stripe from 'server/billing/stripe';
import getRethink from 'server/database/rethinkDriver';
import resolvePromiseObj from 'universal/utils/resolvePromiseObj';
import getUpcomingInvoiceId from 'server/utils/getUpcomingInvoiceId';

const generateUpcomingInvoice = async (orgId) => {
  const r = getRethink();
  const invoiceId = getUpcomingInvoiceId(orgId);
  const {stripeId, stripeSubscriptionId} = await r.table('Organization').get(orgId)
    .pluck('stripeId', 'stripeSubscriptionId');
  const {stripeLineItems, upcomingInvoice} = await resolvePromiseObj({
    stripeLineItems: fetchAllLines('upcoming', stripeId),
    upcomingInvoice: stripe.invoices.retrieveUpcoming(stripeId, {subscription: stripeSubscriptionId})
  });
  return generateInvoice(upcomingInvoice, stripeLineItems, orgId, invoiceId);
};

export default generateUpcomingInvoice;
