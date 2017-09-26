import stripe from 'server/billing/stripe';
import makeUpcomingInvoice from 'server/graphql/models/Invoice/makeUpcomingInvoice';

/*
 * Used as a pseudo hook for trial ending. We could use payment_failed, but that hook is sent 1 hr after this one
 */

export default async function customerSubscriptionUpdated(subscriptionId, oldStatus, exchange) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!subscription) return;
  const {customer, metadata: {orgId}} = subscription;
  // invalidate the upcomingInvoice
  const channel = `upcomingInvoice/${orgId}`;
  const upcomingInvoice = await makeUpcomingInvoice(orgId, customer, subscriptionId);
  const payload = {
    type: 'update',
    fields: upcomingInvoice
  };
  exchange.publish(channel, payload);
}
