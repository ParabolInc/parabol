import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import stripe from '../../billing/stripe'
import getRethink from '../../database/rethinkDriver'
import {PAID} from '../../../client/utils/constants'

export default {
  name: 'StripeSucceedPayment',
  description: 'When stripe tells us an invoice payment was successful, update it in our DB',
  type: GraphQLBoolean,
  args: {
    invoiceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The stripe invoice ID'
    }
  },
  resolve: async (source, {invoiceId}, {serverSecret}) => {
    const r = getRethink()
    const now = new Date()

    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don’t be rude.')
    }

    // VALIDATION
    const {customer: customerId} = await stripe.invoices.retrieve(invoiceId)
    const {
      livemode,
      metadata: {orgId}
    } = await stripe.customers.retrieve(customerId)
    const org = await r.table('Organization').get(orgId)
    if (!org) {
      if (livemode) {
        throw new Error(
          `Payment cannot succeed. Org ${orgId} does not exist for invoice ${invoiceId}`
        )
      }
      return false
    }
    const {creditCard} = org

    // RESOLUTION
    await r
      .table('Invoice')
      .get(invoiceId)
      .update({
        creditCard,
        paidAt: now,
        status: PAID
      })
  }
}
