import Stripe from 'stripe'
import {getStripeManager} from '../../../utils/stripe'

export default async function getCCFromCustomer(customer: Stripe.Customer) {
  if (typeof customer.default_source !== 'string') {
    throw new Error(`Could not find default_source for ${customer.id}`)
  }
  const manager = getStripeManager()
  const card = await manager.retrieveSource(customer.id, customer.default_source)

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
