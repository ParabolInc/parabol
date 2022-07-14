import {InvoiceItemType} from 'parabol-client/types/constEnums'
import Stripe from 'stripe'

export default class StripeManager {
  static PARABOL_PRO_600 = 'parabol-pro-600' // $6/seat/mo
  static PARABOL_ENTERPRISE_2019Q3 = 'plan_Fifb1fmjyFfTm8'
  static WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {apiVersion: '2020-08-27'})

  constructEvent(rawBody: string, signature: string) {
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, StripeManager.WEBHOOK_SECRET)
    } catch (e) {
      console.log('StripeWebhookError:', e)
      return null
    }
  }

  async createCustomer(orgId: string, email: string, source?: string) {
    return this.stripe.customers.create({
      email,
      source,
      metadata: {
        orgId
      }
    })
  }

  async createEnterpriseSubscription(
    customerId: string,
    orgId: string,
    quantity: number,
    plan?: string
  ) {
    return this.stripe.subscriptions.create({
      collection_method: 'send_invoice',
      customer: customerId,
      days_until_due: 30,
      metadata: {
        orgId
      },
      prorate: false,
      items: [
        {
          plan: plan || StripeManager.PARABOL_ENTERPRISE_2019Q3,
          quantity
        }
      ]
    } as any)
  }

  async createProSubscription(customerId: string, orgId: string, quantity: number) {
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

  async deleteSubscription(stripeSubscriptionId: string) {
    return this.stripe.subscriptions.del(stripeSubscriptionId)
  }

  async updateSubscriptionQuantity(
    stripeSubscriptionId: string,
    quantity: number,
    prorationDate?: number
  ) {
    return this.stripe.subscriptions.update(stripeSubscriptionId, {
      quantity,
      proration_date: prorationDate
    })
  }

  async updateInvoice(invoiceId: string, orgId: string) {
    return this.stripe.invoices.update(invoiceId, {metadata: {orgId}})
  }

  async updateInvoiceItem(
    invoiceItemId: string,
    type: InvoiceItemType,
    userId: string,
    hookId: string
  ) {
    return this.stripe.invoiceItems.update(invoiceItemId, {metadata: {type, userId, hookId}})
  }

  async listLineItems(invoiceId: string, options: Stripe.InvoiceLineItemListParams) {
    return this.stripe.invoices.listLineItems(invoiceId, options)
  }

  async retrieveCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId)
  }

  async retrieveInvoice(invoiceId: string) {
    return this.stripe.invoices.retrieve(invoiceId)
  }

  async retrieveInvoiceItem(invoiceItemId: string) {
    return this.stripe.invoiceItems.retrieve(invoiceItemId)
  }

  async retrieveSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId)
  }

  async retrieveUpcomingInvoice(stripeId: string, stripeSubscriptionId: string) {
    return this.stripe.invoices.retrieveUpcoming(stripeId, {
      subscription: stripeSubscriptionId
    })
  }

  async updateAccountBalance(customerId: string, newBalance: number) {
    return this.stripe.customers.update(customerId, {account_balance: newBalance})
  }

  async updatePayment(customerId: string, source: string) {
    return this.stripe.customers.update(customerId, {source})
  }
}
