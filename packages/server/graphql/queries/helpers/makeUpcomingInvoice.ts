import Stripe from 'stripe'
import {fromEpochSeconds} from '../../../utils/epochTime'
import getUpcomingInvoiceId from '../../../utils/getUpcomingInvoiceId'
import {getStripeManager} from '../../../utils/stripe'

export default async function makeUpcomingInvoice(orgId: string, stripeId?: string | null) {
  if (!stripeId) return undefined
  const manager = getStripeManager()
  let stripeInvoice: Stripe.Invoice
  try {
    stripeInvoice = await manager.retrieveUpcomingInvoice(stripeId)
  } catch (e) {
    // useful for debugging prod accounts in dev
    return undefined
  }
  return {
    id: getUpcomingInvoiceId(orgId),
    amountDue: stripeInvoice.amount_due,
    total: stripeInvoice.total,
    endAt: fromEpochSeconds(stripeInvoice.period_end),
    invoiceDate: fromEpochSeconds(stripeInvoice.due_date!),
    orgId,
    startAt: fromEpochSeconds(stripeInvoice.period_start),
    startingBalance: stripeInvoice.starting_balance,
    status: 'UPCOMING'
  }
}
