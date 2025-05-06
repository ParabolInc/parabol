import {InvoiceItemType} from 'parabol-client/types/constEnums'
import Stripe from 'stripe'
import {Logger} from '../Logger'
import sendToSentry from '../sendToSentry'

export default class StripeManager {
  static TEAM_PRICE_APP_ID = 'parabol-pro-800' // $8/seat/mo
  static ENTERPRISE_PRICE_APP_ID = 'plan_2021_ann_low'
  static WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2020-08-27',
    maxNetworkRetries: 3 // retry failed requests up to 3 times. This can happen when accessing the same Stripe object in quick succession: https://github.com/ParabolInc/parabol/issues/8544
  })

  constructEvent(rawBody: string, signature: string) {
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, StripeManager.WEBHOOK_SECRET)
    } catch (e) {
      Logger.log('StripeWebhookError:', e)
      return null
    }
  }

  async attachPaymentToCustomer(
    customerId: string,
    paymentMethodId: string
  ): Promise<Stripe.Response<Stripe.PaymentMethod> | Error> {
    try {
      return await this.stripe.paymentMethods.attach(paymentMethodId, {customer: customerId})
    } catch (e) {
      const error = e as Error
      return error
    }
  }

  async updateSubscription(
    subscriptionId: string,
    paymentMethodId: string
  ): Promise<Stripe.Subscription | Error> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice']
      })
      return subscription
    } catch (e) {
      const error = e as Error
      return error
    }
  }

  async retrieveCardDetails(paymentMethodId: string): Promise<Stripe.PaymentMethod.Card | Error> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId)
      if (paymentMethod.type !== 'card') {
        throw new Error('Payment method is not a card')
      } else if (!paymentMethod.card) {
        throw new Error('Payment method does not have a card')
      }
      return paymentMethod.card
    } catch (e) {
      const error = e as Error
      return error
    }
  }

  async retrieveDefaultCardDetails(customerId: string): Promise<Stripe.PaymentMethod.Card | Error> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId)
      if (customer.deleted) {
        throw new Error('Customer has been deleted')
      }
      const defaultPaymentMethodId = customer.invoice_settings.default_payment_method
      if (!defaultPaymentMethodId) {
        throw new Error('No default payment method found for this customer')
      }
      const paymentMethod = await this.stripe.paymentMethods.retrieve(
        defaultPaymentMethodId as string
      )
      if (paymentMethod.type !== 'card') {
        throw new Error('Default payment method is not a card')
      }
      if (!paymentMethod.card) {
        throw new Error('Default payment method does not have a card')
      }
      return paymentMethod.card
    } catch (e) {
      const error = e as Error
      return error
    }
  }

  async createCustomer(
    orgId: string,
    email: string,
    paymentMethodId?: string | undefined,
    source?: string
  ) {
    try {
      return await this.stripe.customers.create({
        email,
        source,
        payment_method: paymentMethodId,
        invoice_settings: paymentMethodId
          ? {
              default_payment_method: paymentMethodId
            }
          : undefined,
        metadata: {
          orgId
        }
      })
    } catch (e) {
      return e as Error
    }
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
          plan: plan || StripeManager.ENTERPRISE_PRICE_APP_ID,
          quantity
        }
      ]
    })
  }

  async createTeamSubscription(customerId: string, orgId: string, quantity: number) {
    return this.stripe.subscriptions.create({
      // USE THIS FOR TESTING A FAILING PAYMENT
      // https://stripe.com/docs/billing/testing
      // trial_end: toEpochSeconds(new Date(Date.now() + 1000 * 10)),
      customer: customerId,
      proration_behavior: 'none',
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'], // expand the payment intent so we can get the client_secret
      // Use this for testing invoice.created hooks
      // run `pnpm ultrahook` and subscribe
      // the `invoice.created` hook will be run once the billing_cycle_anchor is reached with some slack
      // billing_cycle_anchor: toEpochSeconds(Date.now() + ms('2m')),
      metadata: {
        orgId
      },
      items: [
        {
          plan: StripeManager.TEAM_PRICE_APP_ID,
          quantity
        }
      ]
    })
  }

  async createTeamSubscriptionOld(customerId: string, orgId: string, quantity: number) {
    return this.stripe.subscriptions.create({
      // USE THIS FOR TESTING A FAILING PAYMENT
      // https://stripe.com/docs/billing/testing
      // trial_end: toEpochSeconds(new Date(Date.now() + 1000 * 10)),
      customer: customerId,
      proration_behavior: 'none',
      // Use this for testing invoice.created hooks
      // run `pnpm ultrahook` and subscribe
      // the `invoice.created` hook will be run once the billing_cycle_anchor is reached with some slack
      // billing_cycle_anchor: toEpochSeconds(Date.now() + ms('2m')),
      metadata: {
        orgId
      },
      items: [
        {
          plan: StripeManager.TEAM_PRICE_APP_ID,
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

  async listInvoices(stripeId: string, startingAfter?: string) {
    return this.stripe.invoices.list({customer: stripeId, starting_after: startingAfter})
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

  async listSubscriptionOpenInvoices(subscriptionId: string) {
    return this.stripe.invoices.list({
      subscription: subscriptionId,
      status: 'open'
    })
  }

  async payInvoice(invoiceId: string) {
    return this.stripe.invoices.pay(invoiceId)
  }

  async listLineItems(invoiceId: string, options: Stripe.InvoiceLineItemListParams) {
    return this.stripe.invoices.listLineItems(invoiceId, options)
  }

  async listSources(customerId: string) {
    return this.stripe.customers.listSources(customerId, {object: 'card', limit: 3})
  }

  async listActiveSubscriptions(customerId: string) {
    return this.stripe.subscriptions.list({
      customer: customerId,
      status: 'active'
    })
  }

  async retrieveCharge(chargeId: string) {
    return this.stripe.charges.retrieve(chargeId)
  }

  async retrieveCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId)
  }

  async retrieveInvoice(invoiceId: string) {
    return this.stripe.invoices.retrieve(invoiceId, {
      expand: ['payment_intent']
    })
  }

  async retrieveInvoiceItem(invoiceItemId: string) {
    return this.stripe.invoiceItems.retrieve(invoiceItemId)
  }

  async retrieveSource(customerId: string, cardId: string) {
    return this.stripe.customers.retrieveSource(customerId, cardId)
  }

  async retrieveSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice.payment_intent'] // expand the payment intent so we can get the client_secret
    })
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

  async updateDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    return this.stripe.customers.update(customerId, {
      invoice_settings: {default_payment_method: paymentMethodId}
    })
  }

  async updateSubscriptionItemQuantity(stripeSubscriptionItemId: string, quantity: number) {
    return this.stripe.subscriptionItems.update(stripeSubscriptionItemId, {
      quantity,
      proration_behavior: 'none'
    })
  }
}
