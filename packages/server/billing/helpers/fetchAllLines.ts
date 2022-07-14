import Stripe from 'stripe'
import {getStripeManager} from '../../utils/stripe'
import IInvoiceLineItemRetrievalOptions = Stripe.invoices.IInvoiceLineItemRetrievalOptions

export default async function fetchAllLines(invoiceId: string, customerId?: string) {
  const stripeLineItems = [] as Stripe.InvoiceLineItem[]
  const options = {limit: 100} as IInvoiceLineItemRetrievalOptions
  // used for upcoming invoices
  if (customerId) {
    options.customer = customerId
  }
  const manager = getStripeManager()
  for (let i = 0; i < 100; i++) {
    if (i > 0) {
      options.starting_after = stripeLineItems[stripeLineItems.length - 1]!.id
    }

    const invoiceLines = await manager.retrieveInvoiceLines(invoiceId, options) // eslint-disable-line no-await-in-loop
    stripeLineItems.push(...invoiceLines.data)
    if (!invoiceLines.has_more) break
  }
  return stripeLineItems
}
