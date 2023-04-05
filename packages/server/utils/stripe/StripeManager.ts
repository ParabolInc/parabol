import {InvoiceItemType} from 'parabol-client/types/constEnums'
import Stripe from 'stripe'
import sendToSentry from '../sendToSentry'

export default class StripeManager {
  static PARABOL_TEAM_600 = 'parabol-pro-600' // $6/seat/mo
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

  async attachPaymentToCustomer(customerId: string, paymentMethodId: string) {
    return this.stripe.paymentMethods.attach(paymentMethodId, {customer: customerId})
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
      proration_behavior: 'none',
      items: [
        {
          plan: plan || StripeManager.PARABOL_ENTERPRISE_2019Q3,
          quantity
        }
      ]
    })
  }

  // async createPaymentIntent(amount: number, customerId: string) {
  async createPaymentIntent(amount: number) {
    return this.stripe.paymentIntents.create({
      amount,
      currency: 'usd'
      // customer: customerId
      // setup_future_usage: 'off_session'
      // metadata: {subscription_id: 'your_subscription_id'}
    })
  }

  async createTeamSubscription(customerId: string, orgId: string, quantity: number) {
    return this.stripe.subscriptions.create({
      // USE THIS FOR TESTING A FAILING PAYMENT
      // https://stripe.com/docs/billing/testing
      // trial_end: toEpochSeconds(new Date(Date.now() + 1000 * 10)),
      customer: customerId,
      proration_behavior: 'none',
      // Use this for testing invoice.created hooks
      // run `yarn ultrahook` and subscribe
      // the `invoice.created` hook will be run once the billing_cycle_anchor is reached with some slack
      // billing_cycle_anchor: toEpochSeconds(Date.now() + ms('2m')),
      metadata: {
        orgId
      },
      items: [
        {
          plan: StripeManager.PARABOL_TEAM_600,
          quantity
        }
      ]
    })
  }

  async deleteSubscription(stripeSubscriptionId: string) {
    return this.stripe.subscriptions.del(stripeSubscriptionId)
  }

  async getCustomersByEmail(email: string) {
    return this.stripe.customers.list({email})
  }

  async getSubscriptionItem(subscriptionId: string) {
    const allSubscriptionItems = await this.stripe.subscriptionItems.list({
      subscription: subscriptionId
    })
    // we only include one subscription item in our subscriptions
    if (allSubscriptionItems.data.length > 1) {
      // sanity check
      sendToSentry(new Error(`${subscriptionId} contains more than one subscription item`))
    }
    return allSubscriptionItems.data[0]
  }

  async listLineItems(invoiceId: string, options: Stripe.InvoiceLineItemListParams) {
    return this.stripe.invoices.listLineItems(invoiceId, options)
  }

  async listSources(customerId: string) {
    return this.stripe.customers.listSources(customerId, {object: 'card', limit: 3})
  }

  async retrieveCharge(chargeId: string) {
    return this.stripe.charges.retrieve(chargeId)
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

  async retrieveSource(customerId: string, cardId: string) {
    return this.stripe.customers.retrieveSource(customerId, cardId)
  }

  async retrieveSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId)
  }

  async retrieveUpcomingInvoice(stripeId: string) {
    return this.stripe.invoices.retrieveUpcoming({
      customer: stripeId
    })
  }

  async updateAccountBalance(customerId: string, newBalance: number) {
    return this.stripe.customers.update(customerId, {balance: newBalance})
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

  async updatePayment(customerId: string, source: string) {
    return this.stripe.customers.update(customerId, {source})
  }

  async updateSubscriptionItemQuantity(stripeSubscriptionItemId: string, quantity: number) {
    return this.stripe.subscriptionItems.update(stripeSubscriptionItemId, {
      quantity,
      proration_behavior: 'none'
    })
  }
}
