import getDotenv from '../../server/utils/dotenv'
import Stripe from 'stripe'
// import {toEpochSeconds} from 'server/utils/epochTime'

getDotenv()

export default class StripeManager {
  static PARABOL_PRO_600 = 'parabol-pro-600' // $6/seat/mo
  static PARABOL_ENTERPRISE_2019Q3 = 'plan_Fifb1fmjyFfTm8'
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  async createCustomer (orgId: string, email: string, source?: string) {
    return this.stripe.customers.create({
      email,
      source,
      metadata: {
        orgId
      }
    })
  }

  async createEnterpriseSubscription (customerId: string, orgId: string, quantity) {
    return this.stripe.subscriptions.create({
      // @ts-ignore
      collection_method: 'send_invoice',
      customer: customerId,
      days_until_due: 30,
      metadata: {
        orgId
      },
      prorate: false,
      items: [
        {
          plan: StripeManager.PARABOL_ENTERPRISE_2019Q3,
          quantity
        }
      ]
    })
  }

  async createProSubscription (customerId: string, orgId: string, quantity) {
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

  async updateSubscriptionQuantity (stripeSubscriptionId: string, quantity: number, prorationDate?: number) {
    return this.stripe.subscriptions.update(stripeSubscriptionId, {quantity, proration_date: prorationDate})
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
