import Stripe from 'stripe'

export default function getCCFromCustomer(customer: Stripe.Customer) {
  const card = customer.sources!.data.find(
    (source) => source.id === customer.default_source
  ) as Stripe.Card
  if (!card) {
    throw new Error(`Could not find a card for ${customer.id}`)
  }
  const {brand, last4, exp_month: expMonth, exp_year: expYear} = card
  const expiry = `${expMonth}/${String(expYear).substr(2)}`
  return {
    brand,
    last4,
    expiry
  }
}
