import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../../graphql/uWSAsyncHandler'
import parseBody from '../../parseBody'
import publishWebhookGQL from '../../utils/publishWebhookGQL'
import {getStripeManager} from '../../utils/stripe'

interface InvoiceEventCallBackArg {
  id: string
}

const eventLookup = {
  invoice: {
    created: {
      getVars: ({id: invoiceId}: InvoiceEventCallBackArg) => ({invoiceId}),
      query: `
        mutation StripeCreateInvoice($invoiceId: ID!) {
          stripeCreateInvoice(invoiceId: $invoiceId)
        }
      `
    },
    payment_failed: {
      getVars: ({id: invoiceId}: InvoiceEventCallBackArg) => ({invoiceId}),
      query: `
        mutation StripeFailPayment($invoiceId: ID!) {
          stripeFailPayment(invoiceId: $invoiceId) {
            organization {
              id
            }
          }
        }
      `
    },
    payment_succeeded: {
      getVars: ({id: invoiceId}: InvoiceEventCallBackArg) => ({invoiceId}),
      query: `
        mutation UpgradeToTeamTier($invoiceId: ID!) {
          upgradeToTeamTier(invoiceId: $invoiceId) {
            ... on UpgradeToTeamTierSuccess {
              organization {
                id
              }
            }
          }
        }
      `
    },
    paid: {
      getVars: ({id: invoiceId}: InvoiceEventCallBackArg) => ({invoiceId}),
      query: `
        mutation StripeInvoicePaid($invoiceId: ID!) {
          stripeInvoicePaid(invoiceId: $invoiceId)
        }
      `
    }
  },
  customer: {
    source: {
      updated: {
        getVars: ({customer: customerId}: {customer: string}) => ({customerId}),
        query: `
        mutation StripeUpdateCreditCard($customerId: ID!) {
          stripeUpdateCreditCard(customerId: $customerId)
        }
      `
      }
    },
    subscription: {
      created: {
        getVars: ({customer, id}: {customer: string; id: string}) => ({
          customerId: customer,
          subscriptionId: id
        }),
        query: `
        mutation StripeCreateSubscription($customerId: ID!, $subscriptionId: ID!) {
          stripeCreateSubscription(customerId: $customerId, subscriptionId: $subscriptionId)
        }
      `
      },
      deleted: {
        getVars: ({customer, id}: {customer: string; id: string}) => ({
          customerId: customer,
          subscriptionId: id
        }),
        query: `
        mutation StripeDeleteSubscription($customerId: ID!, $subscriptionId: ID!) {
          stripeDeleteSubscription(customerId: $customerId, subscriptionId: $subscriptionId)
        }
      `
      }
    }
  }
} as const

const mattermostWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  console.log('GEORG request', req, req.headers)
  res.writeStatus('200').end()
})

export default mattermostWebhookHandler
