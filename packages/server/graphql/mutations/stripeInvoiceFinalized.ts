import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import StripeManager from '../../utils/StripeManager'

export default {
  name: 'StripeInvoiceFinalized',
  description: 'An invice has been sent from stripe, meaning it is finalized',
  type: GraphQLBoolean,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (_source, {invoiceId}, {serverSecret}) => {
    const r = getRethink()
    const now = new Date()

    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don’t be rude.')
    }

    // VALIDATION
    const manager = new StripeManager()
    const invoice = await manager.retrieveInvoice(invoiceId)
    const customerId = invoice.customer as string

    const {
      livemode,
      metadata: {orgId}
    } = await manager.retrieveCustomer(customerId)
    const org = await r.table('Organization').get(orgId)
    if (!org) {
      if (livemode) {
        throw new Error(
          `Payment sent cannot be handled. Org ${orgId} does not exist for invoice ${invoiceId}`
        )
      }
      return
    }

    const {collection_method, hosted_invoice_url} = invoice
    if (collection_method !== 'send_invoice') return
    // RESOLUTION
    await r
      .table('Invoice')
      .get(invoiceId)
      .update({
        payUrl: hosted_invoice_url,
        updatedAt: now
      })
  }
}
