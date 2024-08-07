import Stripe from 'stripe'

export const stripeCardToDBCard = (card: Stripe.PaymentMethod.Card) => {
  const {brand, exp_month, exp_year, last4} = card
  const expiryMonth = exp_month.toString().padStart(2, '0')
  const expiryYear = exp_year.toString().slice(2)
  const expiry = `${expiryMonth}/${expiryYear}`
  const formattedBrand = brand.charAt(0).toUpperCase() + brand.slice(1)
  return {
    brand: formattedBrand,
    expiry,
    last4: Number(last4)
  }
}
