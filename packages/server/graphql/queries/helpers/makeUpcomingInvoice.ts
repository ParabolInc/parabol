import Stripe from 'stripe'
import {fromEpochSeconds} from '../../../utils/epochTime'
import getUpcomingInvoiceId from '../../../utils/getUpcomingInvoiceId'
import StripeManager from '../../../utils/StripeManager'

export default async function makeUpcomingInvoice(
  orgId: string,
  stripeId?: string,
  stripeSubscriptionId?: string | null
) {
  if (!stripeId || !stripeSubscriptionId) return undefined
  const manager = new StripeManager()
  let stripeInvoice: Stripe.invoices.IInvoice
  try {
    stripeInvoice = await manager.retrieveUpcomingInvoice(stripeId, stripeSubscriptionId)
  } catch (e) {
    // useful for debugging prod accounts in dev
    return undefined
  }
  return {
    id: getUpcomingInvoiceId(orgId),
    amountDue: stripeInvoice.amount_due,
    total: stripeInvoice.total,
    endAt: fromEpochSeconds(stripeInvoice.period_end),
    invoiceDate: fromEpochSeconds(stripeInvoice.date!),
    orgId,
    startAt: fromEpochSeconds(stripeInvoice.period_start),
    startingBalance: stripeInvoice.starting_balance,
    status: 'UPCOMING'
  }
}
