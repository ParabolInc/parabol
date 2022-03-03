import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import publishWebhookGQL from '../utils/publishWebhookGQL'
import StripeManager from '../utils/StripeManager'

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
        mutation StripeSucceedPayment($invoiceId: ID!) {
          stripeSucceedPayment(invoiceId: $invoiceId)
        }
      `
    },
    finalized: {
      getVars: ({id: invoiceId}: InvoiceEventCallBackArg) => ({invoiceId}),
      query: `
      mutation StripeInvoiceFinalized($invoiceId: ID!) {
        stripeInvoiceFinalized(invoiceId: $invoiceId)
      }`
    }
  },
  invoiceitem: {
    created: {
      getVars: ({id: invoiceItemId}: {id: string}) => ({invoiceItemId}),
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
        getVars: ({customer: customerId}: {customer: string}) => ({customerId}),
        query: `
        mutation StripeUpdateCreditCard($customerId: ID!) {
          stripeUpdateCreditCard(customerId: $customerId)
        }
      `
      }
    }
  }
} as const

const splitType = (type = '') => {
  const names = type.split('.') as [string, string, string?]
  return {
    event: names[0],
    subEvent: names.length === 3 ? names[1] : undefined,
    action: names[names.length - 1]!
  }
}

const stripeWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const stripeSignature = req.getHeader('stripe-signature')
  const parser = (buffer: Buffer) => buffer.toString()
  const str = (await parseBody({res, parser})) as string | null
  res.end()

  if (!str) return
  const manager = new StripeManager()
  const verifiedBody = manager.constructEvent(str, stripeSignature)
  if (!verifiedBody) return

  const {data, type} = verifiedBody
  const {object: payload} = data
  const {event, subEvent, action} = splitType(type)

  const parentHandler = eventLookup[event as keyof typeof eventLookup]
  if (!parentHandler) return

  const eventHandler = subEvent ? (parentHandler as any)[subEvent] : parentHandler
  if (!eventHandler) return

  const actionHandler = eventHandler[action]
  if (!actionHandler) return

  const {getVars, query} = actionHandler
  const variables = getVars(payload)
  publishWebhookGQL(query, variables)
})

export default stripeWebhookHandler
