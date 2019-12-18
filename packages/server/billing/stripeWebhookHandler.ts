import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import ServerAuthToken from '../database/types/ServerAuthToken'
import executeGraphQL from '../graphql/executeGraphQL'
import resDataToBuffer from '../resDataToBuffer'
import stripe from './stripe'

const eventLookup = {
  invoice: {
    created: {
      getVars: ({id: invoiceId}) => ({invoiceId}),
      query: `
        mutation StripeCreateInvoice($invoiceId: ID!) {
          stripeCreateInvoice(invoiceId: $invoiceId)
        }
      `
    },
    payment_failed: {
      getVars: ({id: invoiceId}) => ({invoiceId}),
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
      getVars: ({id: invoiceId}) => ({invoiceId}),
      query: `
        mutation StripeSucceedPayment($invoiceId: ID!) {
          stripeSucceedPayment(invoiceId: $invoiceId)
        }
      `
    },
    finalized: {
      getVars: ({id: invoiceId}) => ({invoiceId}),
      query: `
      mutation StripeInvoiceFinalized($invoiceId: ID!) {
        stripeInvoiceFinalized(invoiceId: $invoiceId)
      }`
    }
  },
  invoiceitem: {
    created: {
      getVars: ({id: invoiceItemId}) => ({invoiceItemId}),
      query: `
        mutation StripeUpdateInvoiceItem($invoiceItemId: ID!) {
          stripeUpdateInvoiceItem(invoiceItemId: $invoiceItemId)
        }
      `
    }
  },
  customer: {
    source: {
      updated: {
        getVars: ({customer: customerId}) => ({customerId}),
        query: `
        mutation StripeUpdateCreditCard($customerId: ID!) {
          stripeUpdateCreditCard(customerId: $customerId)
        }
      `
      }
    }
  }
}

const splitType = (type = '') => {
  const names = type.split('.')
  return {
    event: names[0],
    subEvent: names.length === 3 ? names[1] : undefined,
    action: names[names.length - 1]
  }
}

const stripeWebhookBufferHandler = (res: HttpResponse, sig: string) => (buffer: Buffer) => {
  res.writeStatus('200 OK')
  res.end()
  let verifiedBody
  try {
    verifiedBody = stripe.webhooks.constructEvent(buffer, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    return
  }
  if (!verifiedBody) return

  const {data, type} = verifiedBody
  const {object: payload} = data
  const {event, subEvent, action} = splitType(type)

  const parentHandler = eventLookup[event]
  if (!parentHandler) return

  const eventHandler = subEvent ? parentHandler[subEvent] : parentHandler
  if (!eventHandler) return

  const actionHandler = eventHandler[action]
  if (!actionHandler) return

  const {getVars, query} = actionHandler
  const variables = getVars(payload)
  const authToken = new ServerAuthToken()
  executeGraphQL({authToken, query, variables, isPrivate: true})
}

const stripeWebhookHandler = (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    console.log('stripeWebhookHandler aborted')
  })
  const stripeSignature = req.getHeader('stripe-signature')
  resDataToBuffer(res, stripeWebhookBufferHandler(res, stripeSignature))
}

export default stripeWebhookHandler
