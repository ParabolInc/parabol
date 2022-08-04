import dayJS from 'dayJS'
import Stripe from 'stripe'
import {fromEpochSeconds} from '../../../utils/epochTime'
import getUpcomingInvoiceId from '../../../utils/getUpcomingInvoiceId'
import {getStripeManager} from '../../../utils/stripe'

export default async function makeUpcomingInvoice(orgId: string, stripeId?: string | null) {
  if (!stripeId) return undefined
  const manager = getStripeManager()
  let stripeInvoice: Stripe.Invoice
  let sources: Stripe.Response<Stripe.ApiList<Stripe.CustomerSource>>
  try {
    ;[stripeInvoice, sources] = await Promise.all([
      manager.retrieveUpcomingInvoice(stripeId),
      manager.listSources(stripeId)
    ])
  } catch (e) {
    // useful for debugging prod accounts in dev
    return undefined
  }
  const cardSource = sources.data.find((source): source is Stripe.Card => source.object === 'card')

  const creditCard = cardSource
    ? {
        brand: cardSource.brand,
        last4: cardSource.last4,
        expiry: dayJS(`${cardSource.exp_year}-${cardSource.exp_month}-01`).format('MM/YY')
      }
    : undefined

  return {
    id: getUpcomingInvoiceId(orgId),
    amountDue: stripeInvoice.amount_due,
    creditCard,
    total: stripeInvoice.total,
    endAt: fromEpochSeconds(stripeInvoice.period_end),
    invoiceDate: fromEpochSeconds(stripeInvoice.due_date!),
    orgId,
    startAt: fromEpochSeconds(stripeInvoice.period_start),
    startingBalance: stripeInvoice.starting_balance,
    status: 'UPCOMING'
  }
}
