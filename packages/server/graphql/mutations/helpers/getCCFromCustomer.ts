import Stripe from 'stripe'
import {getStripeManager} from '../../../utils/stripe'

export default async function getCCFromCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer
) {
  if (customer.deleted) {
    throw new Error(`Customer ${customer.id} has been deleted`)
  }
  if (
    typeof customer.default_source !== 'string' &&
    typeof customer.invoice_settings.default_payment_method !== 'string'
  ) {
    throw new Error(`Could not find default_source or default_payment_method for ${customer.id}`)
  }
  const manager = getStripeManager()
  // old customers have default_source
  if (typeof customer.invoice_settings.default_payment_method === 'string') {
    // customers that used Stripe Elements have default_payment_method: https://stripe.com/docs/payments/payment-methods/transitioning?locale=en-GB
    const cardRes = await manager.retrieveDefaultCardDetails(customer.id)
    if (cardRes instanceof Error) {
      console.error(cardRes)
      return undefined
    }
    const expiryMonth = cardRes.exp_month.toString().padStart(2, '0')
    const expiryYear = cardRes.exp_year.toString().slice(2)
    const expiry = `${expiryMonth}/${expiryYear}`
    return {
      brand: cardRes.brand,
      last4: cardRes.last4,
      expiry
    }
  } else {
    const card = await manager.retrieveSource(customer.id, customer.default_source as string)
    if (!card) {
      throw new Error(`Could not find a card for ${customer.id}`)
    }
    if (card.object !== 'card') {
      throw new Error(`Card is type ${card.object}`)
    }
    const {brand, last4, exp_month: expMonth, exp_year: expYear} = card
    const expiry = `${expMonth}/${String(expYear).substr(2)}`
    return {
      brand,
      last4,
      expiry
    }
  }
}
