import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import Stripe from 'stripe'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import InvoiceItemHook from '../../../database/types/InvoiceItemHook'
import {isSuperUser} from '../../../utils/authorization'
import sendToSentry from '../../../utils/sendToSentry'
import StripeManager from '../../../utils/StripeManager'
import {InternalContext} from '../../graphql'

const MAX_STRIPE_DELAY = 3 // seconds

const getPossibleHooks = async (invoiceItem: Stripe.invoiceItems.InvoiceItem) => {
  const r = await getRethink()
  const {
    subscription,
    period: {start},
    amount,
    quantity
  } = invoiceItem
  const isRefund = amount < 0
  const invoiceItemName = isRefund ? 'previousInvoiceItemId' : 'invoiceItemId'
  const quantityName = isRefund ? 'previousQuantity' : 'quantity'

  const proratedHooks = await r
    .table('InvoiceItemHook')
    .between(start - MAX_STRIPE_DELAY, start, {index: 'prorationDate', rightBound: 'closed'})
    .filter({
      [quantityName]: quantity,
      stripeSubscriptionId: subscription as string
    })
    .filter((row) => row(invoiceItemName).default(null).eq(null))
    .orderBy(r.desc('prorationDate'))
    .run()
  if (proratedHooks.length) return proratedHooks
  return r
    .table('InvoiceItemHook')
    .getAll(subscription as string, {index: 'stripeSubscriptionId'})
    .filter({[quantityName]: quantity, isProrated: false})
    .filter((row) => row(invoiceItemName).default(null).eq(null))
    .orderBy(r.desc('createdAt'))
    .run()
}

const getBestHook = (possibleHooks: InvoiceItemHook[]) => {
  if (possibleHooks.length === 1) return possibleHooks[0]!
  const firstHook = possibleHooks[possibleHooks.length - 1]!
  const {id: hookId} = firstHook
  sendToSentry(new Error('Imperfect invoice item hook selected'), {tags: {hookId}})
  return firstHook
}

const tagInvoiceItemWithHook = async (
  invoiceItem: Stripe.invoiceItems.InvoiceItem
): Promise<boolean> => {
  const r = await getRethink()
  const {id: invoiceItemId, amount} = invoiceItem
  const isRefund = amount < 0
  const invoiceItemName = isRefund ? 'previousInvoiceItemId' : 'invoiceItemId'
  const possibleHooks = await getPossibleHooks(invoiceItem)
  if (possibleHooks.length === 0) {
    sendToSentry(new Error('No hooks found invoice item'), {tags: {invoiceItemId}})
    return false
  }

  const hook = getBestHook(possibleHooks)
  const {id: hookId, type, userId} = hook
  const updatedRecord = await r
    .table('InvoiceItemHook')
    .get(hookId)
    .update(
      (row: RValue) => ({
        [invoiceItemName]: row(invoiceItemName).default(invoiceItemId)
      }),
      {returnChanges: true}
    )('changes')(0)('new_val')
    .default(null)
    .run()

  if (!updatedRecord) {
    // another webhook already picked this one, try again
    return tagInvoiceItemWithHook(invoiceItem)
  }

  const manager = new StripeManager()
  await manager.updateInvoiceItem(invoiceItemId, type, userId, hookId)
  return true
}

export default {
  name: 'StripeUpdateInvoiceItem',
  description: 'When a new invoiceitem is sent from stripe, tag it with metadata',
  type: GraphQLBoolean,
  args: {
    invoiceItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (
    _source: unknown,
    {invoiceItemId}: {invoiceItemId: string},
    {authToken}: InternalContext
  ) => {
    // AUTH
    if (!isSuperUser(authToken)) {
      throw new Error('Don’t be rude.')
    }
    const manager = new StripeManager()
    const invoiceItem = await manager.retrieveInvoiceItem(invoiceItemId)
    return tagInvoiceItemWithHook(invoiceItem)
  }
}
