import {fromEpochSeconds, toEpochSeconds} from '../../utils/epochTime'
import {getStripeManager} from '../../utils/stripe'
import type {ReportMeasureFunction, ReportMeasureResult} from '../reportMeasureTypes'

const MAX_INVOICES = 1000
// Stripe finds invoices by when it made them, and one can be paid weeks later
const PAYMENT_DELAY_MS = 90 * 24 * 60 * 60 * 1000

interface Payment {
  paidAt: Date
  // in cents
  amount: number
}

export const sumPaymentsBySteps = (payments: Payment[], stepStarts: Date[], stepEnds: Date[]) =>
  stepStarts.flatMap((start, idx) => {
    const end = stepEnds[idx]!
    const cents = payments
      .filter(({paidAt}) => paidAt >= start && paidAt < end)
      .reduce((sum, {amount}) => sum + amount, 0)
    return cents > 0 ? [{stepIndex: idx + 1, keys: [], value: cents / 100}] : []
  })

// What the organization paid, by when each invoice was paid. Only someone who counts the whole organization sees it
const readSpend: ReportMeasureFunction = async (query, dataLoader) => {
  const result: ReportMeasureResult = {rows: [], estimatedCount: 0, labels: {}, hiddenTeamIds: []}
  if (!query.isWholeOrg) return result
  const {stripeId} = await dataLoader.get('organizations').loadNonNull(query.orgId)
  if (!stripeId) return result
  const searchFrom = query.stepStarts[0]!.getTime() - PAYMENT_DELAY_MS
  const invoices = await getStripeManager()
    .stripe.invoices.list({
      customer: stripeId,
      status: 'paid',
      created: {gte: toEpochSeconds(searchFrom)},
      limit: 100
    })
    .autoPagingToArray({limit: MAX_INVOICES})
  const payments = invoices.map(({amount_paid, created, status_transitions}) => ({
    paidAt: fromEpochSeconds(status_transitions.paid_at ?? created),
    amount: amount_paid
  }))
  return {...result, rows: sumPaymentsBySteps(payments, query.stepStarts, query.stepEnds)}
}

export default readSpend
