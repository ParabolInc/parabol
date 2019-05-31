import getDotenv from 'universal/utils/dotenv'
import Stripe from 'stripe'

getDotenv()

export default class StripeManager {
  static PARABOL_PRO_MONTHLY = 'parabol-pro-monthly' // $12/seat/mo
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  async createCustomer (orgId: string, source: string) {
    return this.stripe.customers.create({
      source,
      metadata: {
        orgId
      }
    })
  }

  async createSubscription (customerId: string, orgId: string, quantity) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      metadata: {
        orgId
      },
      items: [
        {
          plan: StripeManager.PARABOL_PRO_MONTHLY,
          quantity
        }
      ],
      trial_period_days: 0
    })
  }

  async updatePayment (customerId: string, source: string) {
    return this.stripe.customers.update(customerId, {source})
  }
}
