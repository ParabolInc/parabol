import Stripe from 'stripe'
import {Logger} from '../../../utils/Logger'
import {getStripeManager} from '../../../utils/stripe'
import {stripeCardToDBCard} from './stripeCardToDBCard'

export default async function getCCFromCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer
) {
  if (customer.deleted) {
    throw new Error(`Customer ${customer.id} has been deleted`)
  }
  if (!customer.default_source && !customer.invoice_settings.default_payment_method) {
    throw new Error(`Could not find default_source or default_payment_method for ${customer.id}`)
  }
  const manager = getStripeManager()
  if (customer.invoice_settings.default_payment_method) {
    // customers that used Stripe Elements have default_payment_method: https://stripe.com/docs/payments/payment-methods/transitioning?locale=en-GB
    const cardRes = await manager.retrieveDefaultCardDetails(customer.id)
    if (cardRes instanceof Error) {
      Logger.error(cardRes)
      return undefined
    }
    return stripeCardToDBCard(cardRes)
  } else {
    // old customers have default_source
    const defaultSource =
      typeof customer.default_source === 'string'
        ? customer.default_source
        : customer.default_source!.id
    const card = await manager.retrieveSource(customer.id, defaultSource)
    if (!card) {
      throw new Error(`Could not find a card for ${customer.id}`)
    }
    if (card.object !== 'card') {
      throw new Error(`Card is type ${card.object}`)
    }
    const {brand, last4, exp_month: expMonth, exp_year: expYear} = card
    const expiry = `${expMonth.toString().padStart(2, '0')}/${String(expYear).substr(2)}`
    return {
      brand,
      last4: Number(last4),
      expiry
    }
  }
}
