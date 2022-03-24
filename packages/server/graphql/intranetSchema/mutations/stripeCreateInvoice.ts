import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import fetchAllLines from '../../../billing/helpers/fetchAllLines'
import generateInvoice from '../../../billing/helpers/generateInvoice'
import {isSuperUser} from '../../../utils/authorization'
import StripeManager from '../../../utils/StripeManager'
import {InternalContext} from '../../graphql'

export default {
  name: 'StripeCreateInvoice',
  description: 'When stripe tells us an invoice is ready, create a pretty version',
  type: GraphQLBoolean,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (
    _source: unknown,
    {invoiceId}: {invoiceId: string},
    {authToken, dataLoader}: InternalContext
  ) => {
    // AUTH
    if (!isSuperUser(authToken)) {
      throw new Error('Don’t be rude.')
    }

    // RESOLUTION
    const manager = new StripeManager()
    const stripeLineItems = await fetchAllLines(invoiceId)
    const invoice = await manager.retrieveInvoice(invoiceId)
    const {
      metadata: {orgId}
    } = await manager.retrieveCustomer(invoice.customer as string)
    if (!orgId) throw new Error(`orgId not found on metadata for invoice ${invoiceId}`)
    await Promise.all([
      generateInvoice(invoice, stripeLineItems, orgId, invoiceId, dataLoader),
      manager.updateInvoice(invoiceId, orgId)
    ])
    return true
  }
}
