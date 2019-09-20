import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import {InternalContext} from '../../graphql'
import {isSuperUser} from '../../../utils/authorization'
import getRethink from '../../../database/rethinkDriver'
import StripeManager from '../../../utils/StripeManager'

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
    const r = getRethink()

    // AUTH
    if (!isSuperUser(authToken)) {
      throw new Error('Don’t be rude.')
    }

    const manager = new StripeManager()
    const invoiceItem = await manager.retrieveInvoiceItem(invoiceItemId)
    const {
      subscription,
      period: {start}
    } = invoiceItem
    const hook = await r
      .table('InvoiceItemHook')
      .getAll(start, {index: 'prorationDate'})
      .filter({stripeSubscriptionId: subscription})
      .nth(0)
      .default(null)

    if (!hook) return false

    const {type, userId} = hook
    await manager.updateInvoiceItem(invoiceItemId, type, userId)
    return true
  }
}
