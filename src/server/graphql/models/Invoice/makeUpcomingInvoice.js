import {UPCOMING} from 'universal/utils/constants';
import stripe from 'server/billing/stripe';
import {fromEpochSeconds} from 'server/utils/epochTime';

export default async function makeUpcomingInvoice(orgId, stripeId) {
  const stripeInvoice = await stripe.invoices.retrieveUpcoming(stripeId);
  return {
    id: `upcoming_${orgId}`,
    amountDue: stripeInvoice.amount_due,
    cursor: 0,
    total: stripeInvoice.total,
    endAt: fromEpochSeconds(stripeInvoice.period_end),
    invoiceDate: fromEpochSeconds(stripeInvoice.date),
    orgId,
    startAt: fromEpochSeconds(stripeInvoice.period_start),
    startingBalance: stripeInvoice.startingBalance,
    status: UPCOMING
  };
}
