import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {InternalContext} from '../../graphql'
import {isSuperUser} from '../../../utils/authorization'
import getRethink from '../../../database/rethinkDriver'
import StripeManager from '../../../utils/StripeManager'
import InvoiceItemHook from '../../../database/types/InvoiceItemHook'

const MAX_STRIPE_DELAY = 3 // seconds

const getBestHook = (possibleHooks: InvoiceItemHook[], hookQuantity: number) => {
  if (possibleHooks.length === 1) return possibleHooks[0]
  for (let i = 0; i < possibleHooks.length; i++) {
    const curHook = possibleHooks[i]
    const {quantity} = curHook
    // if 2 hooks occurred at the same second, try grabbing the one with the accurate quantity
    if (quantity === hookQuantity) return curHook
  }
  console.log('imperfect invoice item hook selected', possibleHooks[0])
  return possibleHooks[0]
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
  resolve: async (_source, {invoiceItemId}, {authToken}: InternalContext) => {
    const r = await getRethink()

    // AUTH
    if (!isSuperUser(authToken)) {
      throw new Error('Don’t be rude.')
    }

    const manager = new StripeManager()
    const invoiceItem = await manager.retrieveInvoiceItem(invoiceItemId)
    const {
      subscription,
      period: {start},
      quantity,
      amount
    } = invoiceItem

    const possibleHooks = await r
      .table('InvoiceItemHook')
      .between(start - MAX_STRIPE_DELAY, start, {index: 'prorationDate', rightBound: 'closed'})
      .filter({stripeSubscriptionId: subscription as string})
      .orderBy(r.desc('prorationDate'))
      .run()

    if (possibleHooks.length === 0) {
      console.log('No hook found for', invoiceItemId)
      return false
    }

    // if amount < 0, then the line item is a refund for unused time. else, it is a charge for remaining time
    // the InvoiceItemHook.quantity is for the remaining time
    const hookQty = amount < 0 ? quantity - 1 : quantity
    const hook = getBestHook(possibleHooks, hookQty)
    const {type, userId} = hook
    await manager.updateInvoiceItem(invoiceItemId, type, userId)
    return true
  }
}
