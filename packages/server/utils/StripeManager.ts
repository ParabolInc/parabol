import getDotenv from '../../server/utils/dotenv'
import Stripe from 'stripe'
// import {toEpochSeconds} from 'server/utils/epochTime'

getDotenv()

export default class StripeManager {
  static PARABOL_PRO_600 = 'parabol-pro-600' // $6/seat/mo
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
      // USE THIS FOR TESTING A FAILING PAYMENT
      // https://stripe.com/docs/billing/testing
      // trial_end: toEpochSeconds(new Date(Date.now() + 1000 * 10)),
      customer: customerId,
      metadata: {
        orgId
      },
      items: [
        {
          plan: StripeManager.PARABOL_PRO_600,
          quantity
        }
      ]
    })
  }

  async retrieveCustomer (customerId: string) {
    return this.stripe.customers.retrieve(customerId)
  }

  async retrieveInvoice (invoiceId: string) {
    return this.stripe.invoices.retrieve(invoiceId)
  }

  async updateAccountBalance (customerId: string, newBalance: number) {
    return this.stripe.customers.update(customerId, {account_balance: newBalance})
  }

  async updatePayment (customerId: string, source: string) {
    return this.stripe.customers.update(customerId, {source})
  }
}
